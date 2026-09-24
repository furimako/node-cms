#!/bin/sh

#
# Ubuntu
#
# Executed by certbot as root after the certificate is renewed.
# Registered with '--deploy-hook' (see README.md).
#
# Copies the certificate into the app directory so that /etc/letsencrypt
# can stay root-only, then restarts the app to load it.
#

set -e

app_user='furimako'
domain='furimako.com'
live_dir="/etc/letsencrypt/live/${domain}"
ssl_dir="/home/${app_user}/node-cms/configs/production/ssl"

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] starting certbot-deploy-hook.sh"

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO]     L copying certificate to ${ssl_dir}"
mkdir -p $ssl_dir
chown ${app_user}:${app_user} $ssl_dir
chmod 700 $ssl_dir
# 'live_dir' holds symlinks, so install copies the contents of the actual files
install -o $app_user -g $app_user -m 600 ${live_dir}/privkey.pem ${ssl_dir}/privkey.pem
install -o $app_user -g $app_user -m 644 ${live_dir}/cert.pem ${ssl_dir}/cert.pem
install -o $app_user -g $app_user -m 644 ${live_dir}/chain.pem ${ssl_dir}/chain.pem
ls -l $ssl_dir

# node-cms is not running when this script is executed by hand on a new server
if su - $app_user -c 'pm2 describe node-cms' > /dev/null; then
    echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO]     L restarting node-cms"
    su - $app_user -c 'pm2 restart node-cms'
else
    echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO]     L skipped restart (node-cms is not running on pm2)"
fi

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO]     L sending the notification"
su - $app_user -c 'NODE_ENV=production node ~/node-cms/scripts/production/check-cert.js --renewed'

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] finished certbot-deploy-hook.sh"
