#!/bin/sh


# use absolute path pls
# ln -s "$(pwd)/kitty.conf" ~/.config/kitty/kitty.conf

# to use relavtive path , we must add -r option to generate entile path 
# ln -rs kitty destination
# or
# ln -s ../../kitty.conf destination

rm ~/.config/kitty/kitty.conf
echo "rm ~/.config/kitty/kitty.conf"
ln -rs kitty.conf ~/.config/kitty/kitty.conf
echo "kitty config complete"

rm ~/.zimrc
echo "rm ~/.zimrc"
ln -rs .zimrc ~/.zimrc
echo ".zimrc complete"

rm ~/.zshrc
echo "rm ~/.zshrc"
ln -rs .zshrc ~/.zshrc
echo ".zshrc complete"

