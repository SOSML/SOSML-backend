# fix for broken `systemctl --user`
export XDG_RUNTIME_DIR="/run/user/$UID"
export DBUS_SESSION_BUS_ADDRESS="unix:path=${XDG_RUNTIME_DIR}/bus"
echo Stopping...
systemctl --user stop sosml-server.service
echo Updating...
rm -rf ~/server/
mkdir ~/server/
mkdir ~/server/code/
cp -R ./* ~/server/
ln -s ../../server-shares/ ~/server/code/shares
ln -s ../../server-wishares/ ~/server/code/wishares
ln -s ../../server-examples/ ~/server/code/examples
ln -s ../../server-wishes/ ~/server/code/wishes
echo Starting...
systemctl --user start sosml-server.service
echo Done.
