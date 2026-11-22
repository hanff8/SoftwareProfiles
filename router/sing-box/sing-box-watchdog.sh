#!/bin/sh
# Backstop: restart sing-box if it died, and never leave TPROXY blackholing LAN traffic.
TAG=sing-box-watchdog

if [ -z "$(pidof sing-box)" ]; then
	logger -t "$TAG" "sing-box is down; restarting"
	/etc/init.d/sing-box restart
	sleep 5
	if [ -z "$(pidof sing-box)" ]; then
		logger -t "$TAG" "still down; disabling TPROXY to restore direct internet"
		/etc/init.d/sing-box-tproxy stop
	fi
else
	if ! nft list table inet sing_box >/dev/null 2>&1; then
		logger -t "$TAG" "sing-box up but TPROXY missing; restoring"
		/etc/init.d/sing-box-tproxy start
	fi
fi
