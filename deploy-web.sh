#!/bin/bash
echo Preparing...
mkdir -p ~/public/new
cp -R build/* ~/public/new/
echo Swapping...
mv ~/public/$1 ~/public/old
mv ~/public/new ~/public/$1
echo Cleaning up...
rm -rf ~/public/old
echo Done.
