<?php
if ( ! defined( 'ABSPATH' ) ) {
  exit;
}

define( 'GRAND_POPO_THEME_VERSION', '1.0.0' );

function grand_popo_route_pages() {
  return array(
    'accueil' => 'Accueil',
    'commune-presentation' => 'Pr?sentation de la commune',
    'commune-arrondissements' => 'Les arrondissements',
    'commune-villages' => 'Villages et quartiers',
    'commune-histoire' => 'Histoire et culture',
    'commune-patrimoine' => 'Patrimoine naturel',
    'commune-balneaire' => 'Vie baln?aire',
    'mairie-maire' => 'Le maire',
    'mairie-conseil' => 'Conseil communal',
    'mairie-supervision' => 'Conseil de supervision',
    'mairie-commissions' => 'Commissions permanentes',
    'mairie-technique' => 'Services techniques',
    'mairie-infra' => 'Organes infra-communaux',
    'services-etat-civil' => '?tat civil',
    'services-hebergement' => 'Certificat d?h?bergement',
    'services-domanial' => 'Affaires domaniales',
    'services-odp' => 'Occupation du domaine public',
    'services-taxes' => 'Taxes locales',
    'services-marches' => '?quipements marchands',
    'services-publicite' => 'Espace publicitaire',
    'services-stationnement' => 'Stationnement',
    'decouvertes-plages' => 'Plages et littoral',
    'decouvertes-mono' => 'Fleuve Mono',
    'decouvertes-mangroves' => 'Mangroves',
    'decouvertes-nonvitcha' => 'Nonvitcha',
    'citoyen-actualites' => 'Actualit?s',
    'citoyen-projets' => 'Projets phares',
    'citoyen-recrutement' => 'Recrutement',
    'citoyen-signaler' => 'Signalement',
    'contact' => 'Contact',
    'mentions' => 'Mentions l?gales',
  );
}

function grand_popo_theme_setup() {
  add_theme_support( 'title-tag' );
  add_theme_support( 'post-thumbnails' );
  add_theme_support( 'html5', array( 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
  add_theme_support( 'align-wide' );
  add_theme_support( 'responsive-embeds' );
  register_nav_menus(
    array(
      'primary' => __( 'Navigation principale', 'grand-popo' ),
    )
  );
}
add_action( 'after_setup_theme', 'grand_popo_theme_setup' );

function grand_popo_current_route() {
  if ( is_front_page() ) {
    return 'home';
  }

  $post_id = get_queried_object_id();
  if ( ! $post_id ) {
    return 'home';
  }

  $slug = get_post_field( 'post_name', $post_id );
  return $slug ? sanitize_title( $slug ) : 'home';
}

function grand_popo_theme_assets() {
  if ( is_page_template( 'template-elementor-canvas.php' ) || ( isset( $_GET['elementor-preview'] ) && $_GET['elementor-preview'] ) ) {
    return;
  }

  wp_enqueue_style(
    'grand-popo-fonts',
    'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap',
    array(),
    null
  );

  wp_enqueue_style(
    'grand-popo-theme',
    get_theme_file_uri( 'assets/css/site.css' ),
    array(),
    GRAND_POPO_THEME_VERSION
  );

  wp_enqueue_script(
    'grand-popo-theme',
    get_theme_file_uri( 'assets/js/app.js' ),
    array(),
    GRAND_POPO_THEME_VERSION,
    true
  );
}
add_action( 'wp_enqueue_scripts', 'grand_popo_theme_assets' );

function grand_popo_seed_pages() {
  $pages = grand_popo_route_pages();
  $front_id = 0;

  foreach ( $pages as $slug => $title ) {
    $existing = get_page_by_path( $slug, OBJECT, 'page' );
    if ( $existing ) {
      $page_id = $existing->ID;
      wp_update_post(
        array(
          'ID'         => $page_id,
          'post_title' => $title,
          'post_status' => 'publish',
        )
      );
    } else {
      $page_id = wp_insert_post(
        array(
          'post_type'    => 'page',
          'post_status'  => 'publish',
          'post_title'   => $title,
          'post_name'    => $slug,
          'post_content' => '',
        )
      );
    }

    if ( 'accueil' === $slug ) {
      $front_id = (int) $page_id;
    }
  }

  if ( $front_id ) {
    update_option( 'show_on_front', 'page' );
    update_option( 'page_on_front', $front_id );
  }
}
add_action( 'after_switch_theme', 'grand_popo_seed_pages' );
