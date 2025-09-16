#!/bin/bash
set -e

# Directories used
DEB_DIR="/package/deb"                      # Staging tree for the .deb
DIST_DIR="/package/dist"                    # Output directory for built .deb
APP_DIR="/app"                              # SPA source (Vite/Vue)
WWW_DIR="$DEB_DIR/opt/casanode/www"        # Target web root inside package

echo "=== Cleaning previous compiled UI in $WWW_DIR ==="
rm -rf "$WWW_DIR"
mkdir -p "$WWW_DIR"

echo "=== Building SPA in $APP_DIR ==="
cd "$APP_DIR"
npm ci || npm install
# Run Vite build directly to avoid CI failures caused by vue-tsc version mismatches
npx vite build

echo "=== Copying dist to $WWW_DIR ==="
cp -r "$APP_DIR/dist/"* "$WWW_DIR/"

echo "=== Setting permissions on DEBIAN scripts ==="
chmod 755 "$DEB_DIR/DEBIAN/postinst" "$DEB_DIR/DEBIAN/prerm" "$DEB_DIR/DEBIAN/postrm"

# Save the current user (may fail in container; fallback to root)
CURRENT_USER=$(stat -c '%U' "$DEB_DIR" 2>/dev/null || echo root)

echo "=== Setting root ownership for package tree ==="
chown -R root:root "$DEB_DIR"

# Package metadata
PACKAGE_NAME="casanode-ui"
VERSION=$(grep '"version"' "$APP_DIR/package.json" | sed -E 's/.*"version": "([^"]+)".*/\1/')
ARCHITECTURE="all"
DEB_FILE="$DIST_DIR/${PACKAGE_NAME}_${VERSION}_${ARCHITECTURE}.deb"
mkdir -p "$DIST_DIR"

echo "=== Updating DEBIAN/control Version to $VERSION ==="
CONTROL_FILE="$DEB_DIR/DEBIAN/control"
BACKUP_CONTROL_FILE="$DEB_DIR/DEBIAN/control.bak"
cp "$CONTROL_FILE" "$BACKUP_CONTROL_FILE"
sed -i "s/^Version: .*/Version: ${VERSION}/" "$CONTROL_FILE"
sed -i "s/^Package: .*/Package: ${PACKAGE_NAME}/" "$CONTROL_FILE"
echo "Control file now: $(grep -E '^(Package|Version):' "$CONTROL_FILE")"

echo "=== Building .deb package ==="
dpkg-deb --build --root-owner-group "$DEB_DIR" "$DEB_FILE"

echo "=== Restoring original control file ==="
mv "$BACKUP_CONTROL_FILE" "$CONTROL_FILE"

echo "=== Restoring permissions to $CURRENT_USER on $DEB_DIR ==="
chown -R "$CURRENT_USER:$CURRENT_USER" "$DEB_DIR"

echo -e "\e[32mPackage built successfully: $DEB_FILE\e[0m"
