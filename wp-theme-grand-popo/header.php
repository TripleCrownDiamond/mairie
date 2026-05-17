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
    <span class="blue"></span><span class="green"></span><span class="yellow"></span>
  </div>

  <header class="site-header" id="site-header">
    <div class="header-shell">
      <div class="header-top">
        <a class="brand brand-icon-only" href="/" data-route="home" aria-label="Accueil - Mairie de Grand-Popo">
          <span class="brand-mark" aria-hidden="true"><img src="/logos/logo.png" alt="Logo de la Mairie de Grand-Popo" loading="eager" /></span>
        </a>
        <div class="header-top-actions">
          <div class="header-actions"><a class="ghost-action sm" href="/contact">Contact</a><a class="primary-action sm" href="/demarches/etat-civil">E-guichet</a></div>
          <button class="menu-toggle" type="button" aria-label="Ouvrir le menu" aria-expanded="false" data-menu-toggle><span></span><span></span><span></span></button>
        </div>
      </div>
      <div class="header-nav-row">
        <nav class="nav-links" aria-label="Navigation principale" id="nav-links"><?= gp_render_nav($currentKey, gp_data()['NAV']) ?></nav>
      </div>
    </div>
    <aside class="mega-menu" aria-label="M??gamenu" id="mega-menu" hidden>
      <?= gp_render_mega_menu($currentKey) ?>
    </aside>
  </header>

  <div class="mobile-drawer" id="mobile-drawer" hidden>
    <div class="mobile-drawer-inner" id="mobile-drawer-inner"></div>
  </div>
