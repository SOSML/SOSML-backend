# fix for broken `systemctl --user`
export XDG_RUNTIME_DIR="/run/user/$UID"
export DBUS_SESSION_BUS_ADDRESS="unix:path=${XDG_RUNTIME_DIR}/bus"
echo Stopping...
systemctl --user stop sosml-server.service
echo Updating...
rm -rf ~/server/
mkdir ~/server/
mkdir ~/server/code/
mkdir ~/server/code/examples/
cp -R ./* ~/server/
ln -s ../../server-shares/ ~/server/code/shares
echo Starting...
systemctl --user start sosml-server.service
echo Done.
