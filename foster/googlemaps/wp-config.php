<?php
/**
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, WordPress Language, and ABSPATH. You can find more information
 * by visiting {@link http://codex.wordpress.org/Editing_wp-config.php Editing
 * wp-config.php} Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'backstr_svidev1' );

/** MySQL database username */
define( 'DB_USER', 'backstr_svidev1' );

/** MySQL database password */
define( 'DB_PASSWORD', 'devSk13r' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         '-WL*]RB@LO} Crb1Y=n9$PF-@BBD7A11t(f,/PiZh+_qPEF+NUAE!>f0g^]~0zaM');
define('SECURE_AUTH_KEY',  ';+@+?ZM0P{p#rEAM-|-+`pZ-VhJ0u$FQe)t/09q7B1LPdYQ}S|<%NCwcA$Jn+90/');
define('LOGGED_IN_KEY',    '5)I{7+~xgoszO|CBI_aK3N0@Fec^+6K}.s:%e@UWE(@iZM>U}oN(l9+t>>`{}Bvr');
define('NONCE_KEY',        'pI;):~/cAWG4?z{rJe*?uRjsUs<?,uq-C>+dmN^IdrA{iu+e>/iimAEG,TE<7awe');
define('AUTH_SALT',        'Eq4)-z:b`-7$FuC;S4wxTHoOG*$I.m52+[+V|M;&6Z-Zz{hcY@NR(>Lq?;?UYZq{');
define('SECURE_AUTH_SALT', 'fNOaBEsxH.NJ]=.(BFl~3Ew~rM3r}Ih-(63.|S<8ZH-Gmz!%(t(IdP}6gl,[TmH]');
define('LOGGED_IN_SALT',   '!62FH>g-/&QSu_7[5nB3$xj!vIh$gJ!gSw*lZX0<mC^!oe6JAb:`:/lTP@k<+$rx');
define('NONCE_SALT',       'YX*XzLmMZT&$q.|1bjMLcvLWnfH~ ~vj|Qh/37~Jwvo0n}w.#Ul>WjOv$-1?<`kH');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * WordPress Localized Language, defaults to English.
 *
 * Change this to localize WordPress. A corresponding MO file for the chosen
 * language must be installed to wp-content/languages. For example, install
 * de_DE.mo to wp-content/languages and set WPLANG to 'de_DE' to enable German
 * language support.
 */
define('WPLANG', '');

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
