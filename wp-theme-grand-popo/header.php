<?php
if ( ! defined( 'ABSPATH' ) ) {
  exit;
}
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?> data-route="<?php echo esc_attr( grand_popo_current_route() ); ?>">
<?php wp_body_open(); ?>
  <a class="skip-link" href="#main-content">Aller au contenu</a>

  <div class="ticker" aria-label="Annonces officielles">
    <div class="ticker-track" id="ticker-track"></div>
  </div>

  <div class="flag-band" role="presentation" aria-hidden="true">
    <span class="green"></span><span class="yellow"></span><span class="red"></span>
  </div>

  <header class="site-header" id="site-header">
    <div class="header-shell">
      <a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" data-route="home" aria-label="Accueil ? Mairie de Grand-Popo">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" role="presentation">
            <path d="M8 32c6-9 16-13 16-13s10 4 16 13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
            <path d="M12 38c5-5 12-7 12-7s7 2 12 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" opacity=".55" />
            <circle cx="34" cy="14" r="3.6" fill="currentColor" />
          </svg>
        </span>
        <span class="brand-copy">
          <strong>Mairie de Grand-Popo</strong>
          <small>R?publique du B?nin ? Commune baln?aire</small>
        </span>
      </a>

      <button class="menu-toggle" type="button" aria-label="Ouvrir le menu" aria-expanded="false" data-menu-toggle>
        <span></span><span></span><span></span>
      </button>

      <nav class="nav-links" aria-label="Navigation principale" id="nav-links"></nav>

      <div class="header-actions">
        <button type="button" class="ghost-action sm" data-route="contact">Contact</button>
        <button type="button" class="primary-action sm" data-route="services-etat-civil">E-guichet</button>
      </div>
    </div>

    <aside class="mega-menu" aria-label="M?gamenu" id="mega-menu" hidden></aside>
  </header>

  <div class="mobile-drawer" id="mobile-drawer" hidden>
    <div class="mobile-drawer-inner" id="mobile-drawer-inner"></div>
  </div>
