#!/bin/sh
# One-key start/stop for the router's sing-box + TPROXY stack.
#
#   sing-box-ctl            # toggle (one key)
#   sing-box-ctl on|off     # explicit
#   sing-box-ctl status
#
# "off" also disables boot autostart and pauses the watchdog/updater cron
# entries, so the daily 4am reboot does not bring the proxy back.
# "on" restores all of them, then waits for the tproxy listener.
set -u

CRON=/etc/crontabs/root
TAG=sing-box-ctl

running() { [ -n "$(pidof sing-box)" ]; }
tproxy_up() { nft list table inet sing_box >/dev/null 2>&1; }
boot_enabled() { [ -e /etc/rc.d/S99sing-box ] || [ -e /etc/rc.d/S99sing-box-tproxy ]; }
cron_on() { grep -qE '^[^#].*sing-box-(watchdog|update)' "$CRON"; }

wait_port() {
	i=0
	while [ "$i" -lt 15 ]; do
		netstat -ltn 2>/dev/null | grep -q ':7895 ' && return 0
		sleep 1
		i=$((i + 1))
	done
	return 1
}

pause_cron() {
	sed -i '/^[^#].*sing-box-watchdog/s/^/#/' "$CRON"
	sed -i '/^[^#].*sing-box-update/s/^/#/' "$CRON"
	/etc/init.d/cron restart >/dev/null 2>&1
}

resume_cron() {
	sed -i '/^#.*sing-box-watchdog/s/^#//' "$CRON"
	sed -i '/^#.*sing-box-update/s/^#//' "$CRON"
	/etc/init.d/cron restart >/dev/null 2>&1
}

status() {
	if running; then
		echo "sing-box : running (pid $(pidof sing-box))"
	else
		echo "sing-box : stopped"
	fi
	if tproxy_up; then echo "tproxy   : up"; else echo "tproxy   : down"; fi
	if boot_enabled; then echo "boot     : enabled"; else echo "boot     : disabled"; fi
	if cron_on; then echo "cron     : watchdog/updater active"; else echo "cron     : watchdog/updater paused"; fi
	if running && tproxy_up; then
		netstat -ltn 2>/dev/null | grep ':7895 ' | sed 's/^/listen   : /'
	fi
}

start_stack() {
	uci set sing-box.main.enabled=1 2>/dev/null && uci commit sing-box 2>/dev/null
	/etc/init.d/sing-box enable 2>/dev/null
	/etc/init.d/sing-box-tproxy enable 2>/dev/null
	resume_cron
	/etc/init.d/sing-box start
	if wait_port; then
		/etc/init.d/sing-box-tproxy start
	else
		logger -t "$TAG" "sing-box did not open :7895; TPROXY left off"
	fi
	logger -t "$TAG" "started"
	status
}

stop_stack() {
	# Remove the auto-restart paths first: otherwise the 5-minute watchdog
	# or the 5am updater brings sing-box right back.
	pause_cron
	/etc/init.d/sing-box-tproxy stop
	/etc/init.d/sing-box stop
	# procd stops the process asynchronously; wait so the status output below
	# is not stale.
	i=0
	while [ "$i" -lt 10 ] && running; do
		sleep 1
		i=$((i + 1))
	done
	/etc/init.d/sing-box disable 2>/dev/null
	/etc/init.d/sing-box-tproxy disable 2>/dev/null
	logger -t "$TAG" "stopped (boot autostart off, watchdog/updater paused)"
	status
}

case "${1:-toggle}" in
	on|start) start_stack ;;
	off|stop) stop_stack ;;
	toggle|switch)
		if running || tproxy_up; then stop_stack; else start_stack; fi
		;;
	status) status ;;
	*) echo "usage: $0 [on|off|toggle|status]" >&2; exit 2 ;;
esac
