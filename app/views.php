<?php
declare(strict_types=1);


function gp_mojibake_score(string $value): int
{
    $markers = [chr(194), chr(195), chr(197), chr(226)];
    $score = 0;
    foreach ($markers as $marker) {
        $score += substr_count($value, $marker);
    }
    return $score;
}

function gp_fix_text(mixed $value): string
{
    $text = gp_repair_mojibake_text(trim((string) $value));
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');

    if ($text !== '' && function_exists('iconv')) {
        $currentScore = gp_mojibake_score($text);
        if ($currentScore > 0) {
            foreach (['Windows-1252', 'ISO-8859-1'] as $encoding) {
                $candidate = @iconv($encoding, 'UTF-8//IGNORE', $text);
                if (!is_string($candidate) || $candidate === '') {
                    continue;
                }
                if (gp_mojibake_score($candidate) < $currentScore) {
                    $text = $candidate;
                    $currentScore = gp_mojibake_score($text);
                }
                if ($currentScore === 0) {
                    break;
                }
            }
        }
    }

    return str_replace(["\xEF\xBB\xBF", "\xC2\xA0", "\u{FEFF}"], ['', ' ', ''], $text);
}

function gp_ui_label(string $label): string
{
    return gp_fix_text($label);
}

function gp_clean_menu_text(string $text): string
{
    return gp_fix_text($text);
}

function gp_media_url(?string $path, string $fallback = '/assets/facade.jpg'): string
{
    $value = trim((string) $path);
    if ($value === '') {
        return $fallback;
    }
    if (preg_match('#^https?://#i', $value) === 1) {
        return $value;
    }
    return '/' . ltrim($value, '/');
}

function gp_render_ticker(array $ticker): string
{
    $items = [];
    foreach ($ticker as $item) {
        $text = gp_clean_menu_text((string) $item);
        if ($text !== '') {
            $items[] = $text;
        }
    }
    if ($items === []) {
        $items = ['Bienvenue dans la commune de Grand-Popo'];
    }
    if (count($items) === 1) {
        $items[] = $items[0];
    }
    $out = [];
    for ($i = 0; $i < 3; $i++) {
        foreach ($items as $item) {
            $out[] = '<span>' . gp_h($item) . '</span>';
        }
    }
    return implode('', $out);
}

function gp_group_prefix(string $group): string
{
    return match ($group) {
        'commune' => 'commune-',
        'mairie' => 'mairie-',
        'services' => 'services-',
        'citoyen' => 'citoyen-',
        'decouvertes' => 'decouvertes-',
        default => '',
    };
}

function gp_group_home(string $group): string
{
    return match ($group) {
        'commune' => gp_page_path('commune-presentation'),
        'mairie' => gp_page_path('mairie-mot-maire'),
        'services' => gp_page_path('services-demarches'),
        'citoyen' => gp_page_path('citoyen-actualites'),
        'decouvertes' => gp_page_path('decouvertes-plages'),
        default => '/',
    };
}

function gp_menu_link_href(array $link): string
{
    if (!empty($link['href'])) {
        $href = trim((string) $link['href']);
        if ($href === '') {
            return '#';
        }
        if (preg_match('#^https?://#i', $href) === 1) {
            return $href;
        }
        return '/' . ltrim($href, '/');
    }

    if (!empty($link['route'])) {
        return gp_page_path((string) $link['route']);
    }

    return '#';
}

function gp_nav_html(string $activeKey): string
{
    $data = gp_data();
    $items = is_array($data['NAV'] ?? null) ? $data['NAV'] : [];
    $html = [];
    foreach ($items as $item) {
        $label = gp_h(gp_clean_menu_text((string) ($item['label'] ?? '')));
        if (!empty($item['route'])) {
            $key = (string) $item['route'];
            $href = gp_h(gp_page_path($key));
            $class = $activeKey === $key ? 'nav-link is-active' : 'nav-link';
            $html[] = "<a class=\"$class\" href=\"$href\">$label</a>";
            continue;
        }

        if (!empty($item['menu'])) {
            $menu = (string) $item['menu'];
            $prefix = gp_group_prefix($menu);
            $active = $prefix !== '' && str_starts_with($activeKey, $prefix) ? ' is-active' : '';
            $html[] = '<button type="button" class="nav-trigger' . $active . '" data-menu-group="' . gp_h($menu) . '" aria-expanded="false">' . $label . ' <span>&#9662;</span></button>';
        }
    }

    return implode('', $html);
}

function gp_render_mega_menu(): string
{
    $data = gp_data();
    $menus = is_array($data['MENU'] ?? null) ? $data['MENU'] : [];
    if ($menus === []) {
        return '';
    }

    $groups = [];
    foreach ($menus as $menuKey => $menu) {
        $panels = [];
        foreach ((array) ($menu['panels'] ?? []) as $panel) {
            $links = [];
            foreach ((array) ($panel['links'] ?? []) as $link) {
                $links[] = '<a class="mega-link" href="' . gp_h(gp_menu_link_href((array) $link)) . '">' . gp_h(gp_clean_menu_text((string) ($link['label'] ?? 'Page'))) . '</a>';
            }

            $panels[] = '<section class="mega-panel"><h4>' . gp_h(gp_clean_menu_text((string) ($panel['title'] ?? 'Rubrique'))) . '</h4>' . implode('', $links) . '</section>';
        }

        $feature = (array) ($menu['feature'] ?? []);
        $featureHref = !empty($feature) ? gp_menu_link_href($feature) : gp_group_home((string) $menuKey);

        $groups[] = '<div class="mega-shell" data-mega-group="' . gp_h((string) $menuKey) . '" hidden>'
            . '<div class="mega-head"><div><p class="eyebrow no-rule">' . gp_h(gp_clean_menu_text((string) ($menu['kicker'] ?? 'Menu'))) . '</p><h3>' . gp_h(gp_clean_menu_text((string) ($menu['title'] ?? 'Rubrique'))) . '</h3><p>' . gp_h(gp_clean_menu_text((string) ($menu['intro'] ?? ''))) . '</p></div><button class="mega-close" type="button" data-mega-close>Fermer</button></div>'
            . '<div class="mega-grid">'
            . implode('', $panels)
            . '<aside class="mega-feature"><p class="eyebrow on-dark no-rule">A la une</p><h4>' . gp_h(gp_clean_menu_text((string) ($feature['title'] ?? 'Grand-Popo'))) . '</h4><p>' . gp_h(gp_clean_menu_text((string) ($feature['text'] ?? ''))) . '</p><a class="feature-link" href="' . gp_h($featureHref) . '">' . gp_h(gp_clean_menu_text((string) ($feature['cta'] ?? 'Decouvrir'))) . '</a></aside>'
            . '</div></div>';
    }

    return '<div class="mega-menu" id="mega-menu" hidden>' . implode('', $groups) . '</div>';
}

function gp_render_mobile_drawer(): string
{
    $data = gp_data();
    $nav = is_array($data['NAV'] ?? null) ? $data['NAV'] : [];
    $menus = is_array($data['MENU'] ?? null) ? $data['MENU'] : [];

    $items = [];
    foreach ($nav as $item) {
        $label = gp_h(gp_clean_menu_text((string) ($item['label'] ?? '')));
        if (!empty($item['route'])) {
            $items[] = '<a class="drawer-link" href="' . gp_h(gp_page_path((string) $item['route'])) . '">' . $label . '</a>';
            continue;
        }

        if (empty($item['menu'])) {
            continue;
        }

        $menuKey = (string) $item['menu'];
        $menu = (array) ($menus[$menuKey] ?? []);
        $panelLinks = [];
        foreach ((array) ($menu['panels'] ?? []) as $panel) {
            $panelLinks[] = '<p>' . gp_h(gp_clean_menu_text((string) ($panel['title'] ?? 'Section'))) . '</p>';
            foreach ((array) ($panel['links'] ?? []) as $link) {
                $panelLinks[] = '<a class="drawer-link" href="' . gp_h(gp_menu_link_href((array) $link)) . '">' . gp_h(gp_clean_menu_text((string) ($link['label'] ?? 'Page'))) . '</a>';
            }
        }

        $items[] = '<details class="drawer-group"><summary>' . $label . '</summary><div class="drawer-panel">' . implode('', $panelLinks) . '</div></details>';
    }

    return '<aside id="mobile-drawer" class="mobile-drawer" hidden><div class="mobile-drawer-inner"><div class="drawer-top"><strong>Menu</strong><button type="button" data-drawer-close>Fermer</button></div>' . implode('', $items) . '</div></aside>';
}

function gp_render_footer(string $routeKey = ''): string
{
    $email = gp_h((string) gp_config('contact.email', 'contact@mairiegrandpopo.bj'));
    $phoneRaw = (string) gp_config('contact.phone', '+229 0197386269');
    $phone = gp_h($phoneRaw);
    $addr = gp_h((string) gp_config('contact.address', 'Centre ville Grand-Popo'));
    $logo = gp_h(gp_media_url('/logos/Logo-Mairie-Grand-Popo-nouveau.jpg', '/logos/logo.png'));

    $servicesActive = (str_starts_with($routeKey, 'services-') || $routeKey === 'services-demande') ? ' is-active' : '';
    $mentionsActive = $routeKey === 'mentions' ? ' is-active' : '';
    $galleryActive = $routeKey === 'citoyen-realisations' ? ' is-active' : '';
    $newsletterActive = $routeKey === 'contact' ? ' is-active' : '';

    $servicesUrl = gp_h('/mes-demarches-en-ligne');
    $documentationUrl = gp_h('/documentation');
    $privacyUrl = gp_h('/politique-de-confidentialite-2');
    $mentionsUrl = gp_h('/mentions-legales');
    $galleryUrl = gp_h('/galerie');
    $newsletterUrl = gp_h('/inscription-aux-newsletters');

    return '<footer class="site-footer">'
        . '<div class="footer-shell">'
        . '<div class="footer-col footer-brand-col">'
        . '<a class="footer-brand" href="/"><img class="footer-logo" src="' . $logo . '" alt="Logo Mairie Grand-Popo"><span class="footer-brand-copy"><strong>Mairie Grand-Popo</strong><small>Commune balneaire</small></span></a>'
        . '<p class="footer-tagline">Grand-Popo, la ville aux opportunites uniques.</p>'
        . '</div>'
        . '<div class="footer-col"><p class="footer-eyebrow">Liens utiles</p>'
        . '<a class="' . trim('footer-link' . $servicesActive) . '" href="' . $servicesUrl . '">Services en ligne</a>'
        . '<a class="' . trim('footer-link' . $mentionsActive) . '" href="' . $documentationUrl . '">Documentation</a>'
        . '<a class="' . trim('footer-link' . $mentionsActive) . '" href="' . $privacyUrl . '">Politique de confidentialite</a>'
        . '<a class="' . trim('footer-link' . $mentionsActive) . '" href="' . $mentionsUrl . '">Mentions legales</a>'
        . '<a class="' . trim('footer-link' . $galleryActive) . '" href="' . $galleryUrl . '">Galerie</a></div>'
        . '<div class="footer-col"><p class="footer-eyebrow">Adresse et contacts</p>'
        . '<a href="mailto:' . $email . '">' . $email . '</a>'
        . '<a href="tel:' . preg_replace('/\s+/', '', $phoneRaw) . '">' . $phone . '</a>'
        . '<span>' . $addr . '</span></div>'
        . '<div class="footer-col"><p class="footer-eyebrow">Newsletters</p><p>Inscrivez-vous pour recevoir les mises a jour.</p>'
        . '<a class="' . trim('primary-action sm' . $newsletterActive) . '" href="' . $newsletterUrl . '">S inscrire</a></div>'
        . '</div><div class="footer-bottom"><span>Copyright 2026 &copy; Mairie Grand-Popo. Tous droits reserves.</span></div></footer>';
}

function gp_render_layout(string $title, string $description, string $body, string $routeKey, string $canonical, string $ogImage): void
{
    $site = gp_h(gp_site_name());
    $ttl = gp_h(gp_clean_menu_text($title));
    $desc = gp_h(gp_clean_menu_text($description));
    $img = gp_h(gp_media_url($ogImage));
    $logo = gp_h(gp_media_url('/logos/Logo-Mairie-Grand-Popo-nouveau.jpg', '/logos/logo.png'));

    echo '<!doctype html><html lang="fr-FR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<title>' . $ttl . '</title><meta name="description" content="' . $desc . '"><link rel="canonical" href="' . gp_h($canonical) . '">';
    echo '<meta property="og:title" content="' . $ttl . '"><meta property="og:description" content="' . $desc . '"><meta property="og:image" content="' . $img . '">';
    echo '<meta property="og:site_name" content="' . $site . '"><meta name="twitter:card" content="summary_large_image">';
    echo '<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/assets/css/site.css"></head>';
    echo '<body data-route="' . gp_h($routeKey) . '">';
    echo '<div class="flag-band gradient"><span></span><span></span><span></span></div>';
    echo '<div class="ticker"><div class="ticker-track">' . gp_render_ticker(gp_data()['TICKER'] ?? []) . '</div></div>';
        echo '<header class="site-header"><div class="header-shell"><div class="header-top">';
    echo '<a class="brand brand-icon-only" href="/"><span class="brand-mark"><img src="' . $logo . '" alt="Logo"></span><span class="brand-copy"><strong>Mairie Grand-Popo</strong><small>Commune balneaire</small></span></a>';
    echo '<div class="header-top-actions"><a class="ghost-action sm" href="/contact">Contacter le service</a><a class="primary-action sm" href="/mes-demarches-en-ligne">Voir l&#039;e-guichet</a><button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-label="Menu"><span></span><span></span><span></span></button></div></div>';
    echo '<div class="header-nav-row"><nav class="nav-links">' . gp_nav_html($routeKey) . '</nav></div></div>';
    echo gp_render_mega_menu();
    echo '</header>';
    echo gp_render_mobile_drawer();
    echo '<main id="contenu">' . $body . '</main>';
    echo gp_render_footer($routeKey);
    echo '<div class="toast" hidden></div><script src="/assets/js/site.js" defer></script></body></html>';
}

function gp_breadcrumb(string $key, string $title): string
{
    $items = ['<a href="/">Accueil</a>'];
    if (str_starts_with($key, 'commune-')) {
        $items[] = '<a href="' . gp_h(gp_route_url('commune-presentation')) . '">Ma commune</a>';
    } elseif (str_starts_with($key, 'mairie-')) {
        $items[] = '<a href="' . gp_h(gp_route_url('mairie-mot-maire')) . '">Ma municipalite</a>';
    } elseif (str_starts_with($key, 'services-')) {
        $items[] = '<a href="' . gp_h(gp_route_url('services-demarches')) . '">Mes demarches en ligne</a>';
    } elseif (str_starts_with($key, 'citoyen-')) {
        $items[] = '<a href="' . gp_h(gp_route_url('citoyen-actualites')) . '">Mon espace citoyen</a>';
    } elseif (str_starts_with($key, 'decouvertes-')) {
        $items[] = '<a href="' . gp_h(gp_route_url('decouvertes-plages')) . '">Mes decouvertes</a>';
    }
    $items[] = '<span class="current">' . gp_h(gp_clean_menu_text($title)) . '</span>';
    return '<nav class="breadcrumb">' . implode('<span class="sep">/</span>', $items) . '</nav>';
}

function gp_extract_paragraph(string $html): string
{
    $html = gp_repair_mojibake_text($html);
    if (preg_match('/<p[^>]*>(.*?)<\/p>/is', $html, $m) === 1) {
        return gp_excerpt(trim(strip_tags($m[1])), 230);
    }
    return gp_excerpt(trim(strip_tags($html)), 230);
}

function gp_split_figures_from_html(string $html): array
{
    $figures = [];
    if (preg_match_all('/<figure\b[^>]*>[\s\S]*?<\/figure>/i', $html, $m) > 0) {
        foreach ((array) ($m[0] ?? []) as $fig) {
            $fig = trim((string) $fig);
            if ($fig !== '') {
                $figures[] = $fig;
            }
        }
        $html = preg_replace('/<figure\b[^>]*>[\s\S]*?<\/figure>/i', '', $html) ?? $html;
    }

    $html = preg_replace('/\n{3,}/', "\n\n", $html) ?? $html;
    return [trim($html), $figures];
}

function gp_commune_media_item_class(string $figureHtml): string
{
    $classes = [];
    $src = '';
    if (preg_match('/<img\b[^>]*\bsrc=("|\')(.*?)\1/i', $figureHtml, $m) === 1) {
        $src = (string) ($m[2] ?? '');
    }

    if ($src !== '') {
        if (preg_match('/-(\d+)x(\d+)\.(png|jpe?g|webp|gif)$/i', $src, $dim) === 1) {
            $w = (int) ($dim[1] ?? 0);
            $h = (int) ($dim[2] ?? 0);
            if ($w > 0 && $h > 0 && $h > $w) {
                $classes[] = 'is-portrait';
            }
        }

        if (preg_match('/position-geostrategique|carte|\bmap\b/i', $src) === 1) {
            $classes[] = 'is-map';
        }
    }

    return implode(' ', array_unique($classes));
}

function gp_render_home(array $data, array $slides, string $key, array $blogPosts = []): string
{
    $slides = $slides !== [] ? $slides : [['image' => '/assets/facade.jpg', 'title' => 'Bienvenue a Grand-Popo', 'subtitle' => '', 'desc' => '']];
    $images = [];
    $slideHtml = [];
    foreach ($slides as $i => $slide) {
        $img = gp_media_url((string) ($slide['image'] ?? '/assets/facade.jpg'));
        $images[] = $img;
        $active = $i === 0 ? ' is-active' : '';
        $slideHtml[] = '<article class="hero-slide' . $active . '" data-hero-slide aria-hidden="' . ($i === 0 ? 'false' : 'true') . '">'
            . '<div class="hero-slide-copy"><span class="hero-slide-kicker">Portail citoyen</span>'
            . '<h1>' . gp_h(gp_clean_menu_text((string) ($slide['title'] ?? 'Bienvenue a Grand-Popo'))) . '</h1>'
            . '<p class="hero-slide-subtitle">' . gp_h(gp_clean_menu_text((string) ($slide['subtitle'] ?? ''))) . '</p>'
            . '<p class="hero-lead">' . gp_h(gp_clean_menu_text((string) ($slide['desc'] ?? ''))) . '</p>'
            . '<div class="hero-actions"><a class="primary-action" href="/mes-demarches-en-ligne">Mes demarches en ligne</a><a class="ghost-action" href="/contact">Contact</a></div></div></article>';
    }

    $quick = [];
    foreach ((array) ($data['HERO_QUICK'] ?? []) as $item) {
        $href = gp_route_url((string) ($item['route'] ?? 'services-demarches'));
        $quick[] = '<a class="hero-quick-item" href="' . gp_h($href) . '"><span class="ico">' . gp_h((string) ($item['mark'] ?? 'SV')) . '</span>' . gp_h(gp_clean_menu_text((string) ($item['label'] ?? 'Service'))) . '</a>';
    }

    $stats = [];
    foreach ((array) ($data['STATS'] ?? []) as $stat) {
        $stats[] = '<article class="stat"><div class="stat-ico">' . ((string) ($stat['icon'] ?? '?')) . '</div><div><div class="stat-value">' . gp_h((string) ($stat['value'] ?? '0')) . ' <span class="suffix">' . gp_h((string) ($stat['suffix'] ?? '')) . '</span></div><div class="stat-label">' . gp_h(gp_clean_menu_text((string) ($stat['label'] ?? ''))) . '</div></div></article>';
    }

    $mot = gp_data()['PAGES']['mairie-mot-maire']['blocks'][0]['body'] ?? '';
    $motPreview = gp_extract_paragraph((string) $mot);

    $newsCards = [];
    $posts = $blogPosts;
    if ($posts === []) {
        $posts = gp_blog_posts(4, 0);
    }
    foreach (array_slice($posts, 0, 4) as $post) {
        $slug = (string) ($post['slug'] ?? '');
        $newsCards[] = '<article class="news-card reveal"><div class="img"><img src="' . gp_h(gp_media_url((string) ($post['image'] ?? '/assets/gbekon.jpg'))) . '" alt=""></div><div class="body"><p class="news-kicker">Actualites</p><h3>' . gp_h(gp_clean_menu_text((string) ($post['title'] ?? 'Article'))) . '</h3><p>' . gp_h(gp_excerpt(gp_clean_menu_text((string) ($post['excerpt'] ?? '')), 110)) . '</p><a class="text-link" href="/blog/' . gp_h($slug) . '">Lire la suite</a></div></article>';
    }

    $flip = [];
    foreach ((array) ($data['HOME_FLIP'] ?? []) as $card) {
        $back = (array) ($card['back'] ?? []);
        $flip[] = '<article class="flip-card reveal" tabindex="0"><div class="flip-inner"><div class="flip-face flip-front"><span class="num">' . gp_h((string) ($card['num'] ?? '00')) . '</span><div><h3>' . gp_h(gp_clean_menu_text((string) ($card['title'] ?? ''))) . '</h3><p class="sub">' . gp_h(gp_clean_menu_text((string) ($card['sub'] ?? ''))) . '</p></div></div><div class="flip-face flip-back"><span class="tag">' . gp_h(gp_clean_menu_text((string) ($back['tag'] ?? 'Ma commune'))) . '</span><div><h4>' . gp_h(gp_clean_menu_text((string) ($back['title'] ?? ''))) . '</h4><p>' . gp_h(gp_clean_menu_text((string) ($back['text'] ?? ''))) . '</p></div><a class="card-button" href="' . gp_h(gp_route_url((string) ($back['route'] ?? 'commune-presentation'))) . '">' . gp_h(gp_clean_menu_text((string) ($back['cta'] ?? 'Ouvrir'))) . '</a></div></div></article>';
    }

    return '<section class="hero hero-home" data-hero data-hero-images="' . gp_h(json_encode($images, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) . '"><div class="hero-bg" data-hero-bg style="background-image:url(' . gp_h($images[0]) . ')"></div><div class="hero-shell"><div class="hero-head"><span class="hero-pill"><span class="dot"></span>Bienvenue</span></div><div class="hero-stage">' . implode('', $slideHtml) . '</div><div class="hero-controls"><button class="hero-control" data-hero-prev>&larr;</button><span class="hero-counter"><span data-hero-current>01</span><span class="sep">/</span><span data-hero-total>' . str_pad((string) count($slides), 2, '0', STR_PAD_LEFT) . '</span></span><button class="hero-control" data-hero-next>&rarr;</button></div><div class="hero-quick">' . implode('', $quick) . '</div></div></section>'
        . '<section class="stats-band"><div class="stats-card">' . implode('', $stats) . '</div></section>'
        . '<section class="section"><div class="container"><div class="mayor"><figure class="mayor-image reveal"><img src="' . gp_h(gp_media_url('/assets/mairie/maire-ayikpe.jpg')) . '" alt="Maire"><figcaption class="mayor-badge"><div class="role">Maire</div><div class="name">AYIKPE YAO CARLOS</div></figcaption></figure><div class="mayor-content reveal"><p class="eyebrow">Mot du maire</p><h2>Une commune en mouvement</h2><div class="mayor-quote"><p>' . gp_h($motPreview) . '</p></div><a class="primary-action" href="' . gp_h(gp_route_url('mairie-mot-maire')) . '">Lire le mot du maire</a></div></div></div></section>'
        . '<section class="section section-tight"><div class="container"><div class="section-head"><div><p class="eyebrow">Actualites</p><h2>Apercu des articles</h2></div><a class="text-link" href="/blog">Voir tout</a></div><div class="news-list">' . implode('', $newsCards) . '</div></div></section>'
        . '<section class="section"><div class="container"><div class="section-head"><div><p class="eyebrow">Ma commune</p><h2>Pages connexes</h2></div></div><div class="flip-grid">' . implode('', $flip) . '</div></div></section>';
}

function gp_render_related_pages(string $key): string
{
    $pages = gp_data()['PAGES'] ?? [];
    $prefix = explode('-', $key, 2)[0] ?? '';
    if ($prefix === '') {
        return '';
    }

    $cards = [];
    $idx = 1;
    foreach ($pages as $pkey => $page) {
        if ($pkey === $key || !str_starts_with((string) $pkey, $prefix . '-')) {
            continue;
        }

        $title = gp_clean_menu_text((string) ($page['title'] ?? $pkey));
        $lead = gp_excerpt(gp_clean_menu_text((string) ($page['lead'] ?? '')), 140);
        $num = str_pad((string) $idx, 2, '0', STR_PAD_LEFT);

        $cards[] = '<article class="flip-card reveal" tabindex="0"><div class="flip-inner">'
            . '<div class="flip-face flip-front"><span class="num">' . gp_h($num) . '</span><div><h3>' . gp_h($title) . '</h3><p class="sub">' . gp_h($lead) . '</p></div></div>'
            . '<div class="flip-face flip-back"><span class="tag">Pages connexes</span><div><h4>' . gp_h($title) . '</h4><p>' . gp_h($lead) . '</p></div><a class="card-button" href="' . gp_h(gp_page_path((string) $pkey)) . '">Ouvrir la page</a></div>'
            . '</div></article>';

        $idx++;
        if (count($cards) >= 6) {
            break;
        }
    }

    if ($cards === []) {
        return '';
    }

    return '<section class="section-tight related-pages"><div class="section-head"><div><p class="eyebrow">Pages connexes</p><h2>Naviguer dans cette rubrique</h2></div></div><div class="flip-grid three-up tight related-flip-grid">' . implode('', $cards) . '</div></section>';
}

function gp_render_cards_block(array $items): string
{
    $cards = [];
    foreach ($items as $item) {
        $cards[] = '<article class="info-card has-image reveal"><figure class="info-card-media"><img src="' . gp_h(gp_media_url((string) ($item['image'] ?? '/assets/facade.jpg'))) . '" alt=""></figure><div class="info-card-body"><h4>' . gp_h(gp_clean_menu_text((string) ($item['title'] ?? ''))) . '</h4>' . (!empty($item['subtitle']) ? '<p><strong>' . gp_h(gp_clean_menu_text((string) $item['subtitle'])) . '</strong></p>' : '') . (!empty($item['text']) ? '<p>' . gp_h(gp_clean_menu_text((string) $item['text'])) . '</p>' : '') . '</div></article>';
    }
    return '<div class="duo-grid has-media">' . implode('', $cards) . '</div>';
}


function gp_render_arrondissements_cards(string $html): string
{
    $clean = trim($html);
    if ($clean === '') {
        return '';
    }

    $intro = '';
    if (preg_match('/^(.*?)(<h2\b[^>]*>\s*1\s*-\s*[^<]+<\/h2>)/is', $clean, $parts) === 1) {
        $intro = trim((string) ($parts[1] ?? ''));
    }

    $cards = [];
    if (preg_match_all('/<h2\b[^>]*>\s*(\d+)\s*-\s*([^<]+?)\s*<\/h2>\s*<ul[^>]*>([\s\S]*?)<\/ul>/i', $clean, $m, PREG_SET_ORDER) > 0) {
        foreach ($m as $row) {
            $num = str_pad((string) ((int) ($row[1] ?? 0)), 2, '0', STR_PAD_LEFT);
            $name = gp_clean_menu_text(trim(strip_tags((string) ($row[2] ?? ''))));
            $itemsHtml = [];
            if (preg_match_all('/<li[^>]*>(.*?)<\/li>/is', (string) ($row[3] ?? ''), $li) > 0) {
                foreach ((array) ($li[1] ?? []) as $meta) {
                    $line = gp_clean_menu_text(trim(strip_tags((string) $meta)));
                    if ($line === '') {
                        continue;
                    }

                    $label = $line;
                    $value = '';
                    if (str_contains($line, ':')) {
                        [$label, $value] = array_map('trim', explode(':', $line, 2));
                    }

                    $itemsHtml[] = '<li><span class="meta-label">' . gp_h($label) . '</span>'
                        . ($value !== '' ? '<span class="meta-value">' . gp_h($value) . '</span>' : '')
                        . '</li>';
                }
            }

            $cards[] = '<article class="arr-card reveal">'
                . '<header class="arr-card-head"><span class="arr-num">' . gp_h($num) . '</span><h3>' . gp_h($name) . '</h3></header>'
                . '<ul class="arr-meta">' . implode('', $itemsHtml) . '</ul>'
                . '</article>';
        }
    }

    if ($cards === []) {
        return $clean;
    }

    $introHtml = $intro !== '' ? '<div class="arrondissements-intro">' . $intro . '</div>' : '';
    return '<section class="arrondissements-layout">' . $introHtml . '<div class="arrondissements-grid">' . implode('', $cards) . '</div></section>';
}



function gp_render_villages_cards(string $html): string
{
    $clean = trim($html);
    if ($clean === '') {
        return '';
    }

    $intro = '';
    if (preg_match('/^(.*?)(<h2\b[^>]*>\s*[A-Z0-9\- ]+\s*<\/h2>)/is', $clean, $parts) === 1) {
        $intro = trim((string) ($parts[1] ?? ''));
    }

    $cards = [];
    if (preg_match_all('/<h2\b[^>]*>\s*([^<]+?)\s*<\/h2>\s*<p[^>]*>([\s\S]*?)<\/p>/i', $clean, $m, PREG_SET_ORDER) > 0) {
        foreach ($m as $row) {
            $arr = gp_clean_menu_text(trim(strip_tags((string) ($row[1] ?? ''))));
            $raw = gp_clean_menu_text(trim(strip_tags((string) ($row[2] ?? ''))));
            if ($arr === '' || $raw === '') {
                continue;
            }

            $normalized = str_replace(' et ', ', ', $raw);
            $villages = [];
            foreach (explode(',', $normalized) as $name) {
                $name = trim((string) $name);
                if ($name !== '') {
                    $villages[] = $name;
                }
            }

            $items = [];
            foreach ($villages as $name) {
                $items[] = '<li>' . gp_h($name) . '</li>';
            }

            $cards[] = '<article class="village-card reveal">'
                . '<header><h3>' . gp_h($arr) . '</h3><p>' . count($villages) . ' villages et quartiers</p></header>'
                . '<ul>' . implode('', $items) . '</ul>'
                . '</article>';
        }
    }

    if ($cards === []) {
        return $clean;
    }

    $introHtml = $intro !== '' ? '<div class="villages-intro">' . $intro . '</div>' : '';
    return '<section class="villages-layout">' . $introHtml . '<div class="villages-grid">' . implode('', $cards) . '</div></section>';
}
function gp_render_services_catalog_cards(): string
{
    $catalog = gp_services_catalog();
    $categories = is_array($catalog['categories'] ?? null) ? $catalog['categories'] : [];
    $wanted = gp_fix_text((string) ($_GET['categorie'] ?? ''));
    $chunks = [];
    foreach ($categories as $cat) {
        $slug = (string) ($cat['slug'] ?? '');
        if ($wanted !== '' && $wanted !== $slug) {
            continue;
        }
        $cards = [];
        foreach ((array) ($cat['services'] ?? []) as $service) {
            $name = gp_clean_menu_text((string) ($service['name'] ?? $service['title'] ?? 'Service'));
            $desc = gp_clean_menu_text((string) ($service['description'] ?? ''));
            $price = gp_clean_menu_text((string) ($service['price'] ?? 'Tarif a confirmer'));
            $cta = '/demande?' . http_build_query(['categorie' => $slug, 'service' => (string) ($service['name'] ?? $service['title'] ?? '')]);
            $cards[] = '<article class="info-card reveal"><div class="ico">' . gp_h(strtoupper(substr($slug !== '' ? $slug : 'SV', 0, 2))) . '</div><h4>' . gp_h($name) . '</h4><p>' . gp_h($desc) . '</p><p><strong>Prix:</strong> ' . gp_h($price) . '</p><a class="card-button" href="' . gp_h($cta) . '">Demarrer la demande</a></article>';
        }
        if ($cards !== []) {
            $chunks[] = '<section class="section-tight"><div class="section-head"><div><p class="eyebrow">Services</p><h2>' . gp_h(gp_clean_menu_text((string) ($cat['label'] ?? $slug))) . '</h2></div></div><div class="duo-grid has-media">' . implode('', $cards) . '</div></section>';
        }
    }
    return $chunks === [] ? '<article class="prose"><p>Aucun service disponible.</p></article>' : implode('', $chunks);
}

function gp_render_page(string $key, array $page): string
{
    $title = gp_clean_menu_text((string) ($page['title'] ?? 'Page'));
    $lead = gp_clean_menu_text((string) ($page['lead'] ?? ''));
    $image = gp_media_url((string) ($page['image'] ?? '/assets/facade.jpg'));

    if ($key === 'services-demarches') {
        return '<section class="page-hero"><div class="page-hero-shell"><div>' . gp_breadcrumb($key, $title) . '<h1>' . gp_h($title) . '</h1><p class="lead">' . gp_h($lead) . '</p><div class="hero-actions"><a class="primary-action" href="/demande">Faire une demande</a><a class="ghost-action" href="/suivi-des-demandes">Suivre ma demande</a></div></div><figure class="page-hero-image"><img src="' . gp_h($image) . '" alt=""></figure></div></section><section class="section"><div class="container">' . gp_render_services_catalog_cards() . gp_render_related_pages($key) . '</div></section>';
    }

    if ($key === 'citoyen-actualites') {
        gp_sync_blog_posts();
        $per = 12;
        $cur = max(1, (int) ($_GET['page'] ?? 1));
        $total = (int) (gp_db()->query('SELECT COUNT(*) AS c FROM blog_posts')->fetch()['c'] ?? 0);
        $last = max(1, (int) ceil($total / $per));
        $cur = min($cur, $last);
        $posts = gp_blog_posts($per, ($cur - 1) * $per);

        $cards = [];
        foreach ($posts as $post) {
            $slug = (string) ($post['slug'] ?? '');
            $cards[] = '<article class="eael-grid-post reveal"><div class="eael-grid-post-holder"><div class="eael-grid-post-holder-inner"><a class="eael-entry-thumbnail" href="/blog/' . gp_h($slug) . '"><img src="' . gp_h(gp_media_url((string) ($post['image'] ?? '/assets/gbekon.jpg'))) . '" alt=""></a><div class="eael-entry-wrapper"><h3 class="eael-entry-title"><a href="/blog/' . gp_h($slug) . '">' . gp_h(gp_clean_menu_text((string) ($post['title'] ?? 'Article'))) . '</a></h3><div class="eael-entry-meta"><span>' . gp_h((string) ($post['published_at'] ?? '')) . '</span></div><div class="eael-entry-content"><div class="eael-grid-post-excerpt"><p>' . gp_h(gp_excerpt(gp_clean_menu_text((string) ($post['excerpt'] ?? '')), 170)) . '</p><a class="eael-post-elements-readmore-btn" href="/blog/' . gp_h($slug) . '">Lire plus</a></div></div></div></div></div></article>';
        }

        $pages = [];
        $prev = $cur > 1 ? gp_page_path($key) . '?page=' . ($cur - 1) : '#';
        $next = $cur < $last ? gp_page_path($key) . '?page=' . ($cur + 1) : '#';
        $pages[] = '<a class="news-page' . ($cur <= 1 ? ' is-disabled' : '') . '" href="' . gp_h($prev) . '">&laquo;</a>';
        for ($i = 1; $i <= $last; $i++) {
            if ($i === 1 || $i === $last || abs($i - $cur) <= 2) {
                $pages[] = '<a class="news-page' . ($i === $cur ? ' is-current' : '') . '" href="' . gp_h(gp_page_path($key) . '?page=' . $i) . '">' . $i . '</a>';
            }
        }
        $pages[] = '<a class="news-page' . ($cur >= $last ? ' is-disabled' : '') . '" href="' . gp_h($next) . '">&raquo;</a>';

        return '<section class="page-hero"><div class="page-hero-shell"><div>' . gp_breadcrumb($key, $title) . '<h1>' . gp_h($title) . '</h1><p class="lead">' . gp_h($lead) . '</p></div><figure class="page-hero-image"><img src="' . gp_h($image) . '" alt=""></figure></div></section><section class="section"><div class="container"><div class="page-content-grid"><article class="prose"><div class="eael-post-grid-container"><div class="eael-post-grid">' . implode('', $cards) . '</div></div><nav class="news-pagination">' . implode('', $pages) . '</nav></article></div></div></section>';
    }

    $prose = [];
    $cards = [];
    $communeFigures = [];
    foreach ((array) ($page['blocks'] ?? []) as $block) {
        $type = (string) ($block['type'] ?? 'prose');
        if ($type === 'cards3') {
            $cards[] = gp_render_cards_block((array) ($block['items'] ?? []));
            continue;
        }
        $html = gp_repair_mojibake_text((string) ($block['body'] ?? ''));
        $html = preg_replace_callback('/\b(src|href)=("|\')(?!https?:\/\/|\/|#|mailto:|tel:)([^"\']+)\2/i', static fn($m) => $m[1] . '=' . $m[2] . '/' . ltrim($m[3], '/') . $m[2], $html) ?? $html;

        if ($key === 'commune-arrondissements') {
            $prose[] = '<div class="prose">' . gp_render_arrondissements_cards($html) . '</div>';
            continue;
        }

        if ($key === 'commune-villages') {
            $prose[] = '<div class="prose">' . gp_render_villages_cards($html) . '</div>';
            continue;
        }

        if ($key === 'commune-presentation') {
            [$html, $figures] = gp_split_figures_from_html($html);
            if ($figures !== []) {
                $communeFigures = array_merge($communeFigures, $figures);
            }
        }

        $prose[] = '<div class="prose">' . $html . '</div>';
    }

    $form = '';
    if ($key === 'citoyen-signaler') {
        $form = '<form class="request-form reveal" method="post" action="' . gp_h(gp_page_path($key)) . '"><div class="row"><label>Nom complet<input type="text" name="nom" required></label><label>Telephone<input type="tel" name="telephone" required></label></div><label>Email<input type="email" name="email"></label><label>Objet<input type="text" name="objet" required></label><label>Details<textarea name="message" rows="6" required></textarea></label><button class="primary-action" type="submit">Envoyer le signalement</button></form>';
    }

    $maireProfiles = '';
    if ($key === 'mairie-maire' && $cards !== []) {
        $maireProfiles = '<section class="section-tight mairie-team-section"><div class="section-head"><div><p class="eyebrow">Equipe municipale</p><h2>Le Maire et ses adjoints</h2></div></div>' . implode('', $cards) . '</section>';
        $cards = [];
    }

    $mairieCouncilProfiles = '';
    if ($key === 'mairie-conseil' && $cards !== []) {
        $mairieCouncilProfiles = '<section class="section-tight mairie-council-section"><div class="section-head"><div><p class="eyebrow">Conseil communal</p><h2>Les 15 conseillers de Grand-Popo</h2></div></div>' . implode('', $cards) . '</section>';
        $cards = [];
    }

    $mairieSupervisionProfiles = '';
    if ($key === 'mairie-supervision' && $cards !== []) {
        $mairieSupervisionProfiles = '<section class="section-tight mairie-supervision-section"><div class="section-head"><div><p class="eyebrow">Conseil de supervision</p><h2>Le Maire, ses adjoints et les prÃ©sidents de commissions</h2></div></div>' . implode('', $cards) . '</section>';
        $cards = [];
    }

    $mairieCommissionsProfiles = '';
    if ($key === 'mairie-commissions' && $cards !== []) {
        $mairieCommissionsProfiles = '<section class="section-tight mairie-commissions-section"><div class="section-head"><div><p class="eyebrow">Commissions permanentes</p><h2>Les presidents des commissions permanentes</h2></div></div>' . implode('', $cards) . '</section>';
        $cards = [];
    }

    $mairieInfraProfiles = '';
    if ($key === 'mairie-infra' && $cards !== []) {
        $mairieInfraProfiles = '<section class="section-tight mairie-infra-section"><div class="section-head"><div><p class="eyebrow">Organes infra-communaux</p><h2>Les chefs d\'arrondissement</h2></div></div>' . implode('', $cards) . '</section>';
        $cards = [];
    }

    $mairieTechniqueProfiles = '';
    if ($key === 'mairie-technique' && $cards !== []) {
        $mairieTechniqueProfiles = '<section class="section-tight mairie-technique-section"><div class="section-head"><div><p class="eyebrow">Organes techniques et administratifs</p><h2>Le Secrétariat exécutif et les directions</h2></div></div>' . implode('', $cards) . '</section>';
        $cards = [];
    }

    $two = $cards !== [] || $key === 'commune-presentation';
    $aside = '';
    $below = '';

    if ($key === 'commune-presentation') {
        $media = [];
        foreach ($communeFigures as $i => $fig) {
            $classes = [];
            if ($i % 3 === 0) {
                $classes[] = 'is-wide';
            }

            $kind = gp_commune_media_item_class($fig);
            if ($kind !== '') {
                $classes[] = $kind;
            }

            $media[] = '<div class="commune-media-item ' . implode(' ', $classes) . '">' . $fig . '</div>';
        }

        if ($media !== []) {
            $aside = '<aside class="commune-media-rail reveal"><div class="commune-media-head"><p class="eyebrow">Galerie</p><h3>Reperes visuels</h3></div><div class="commune-media-grid">' . implode('', $media) . '</div></aside>';
        }
        $below = gp_render_related_pages($key);
    } elseif ($key === 'mairie-maire') {
        $below = $maireProfiles . gp_render_related_pages($key);
    } elseif ($key === 'mairie-conseil') {
        $below = $mairieCouncilProfiles . gp_render_related_pages($key);
    } elseif ($key === 'mairie-supervision') {
        $below = $mairieSupervisionProfiles . gp_render_related_pages($key);
    } elseif ($key === 'mairie-commissions') {
        $below = $mairieCommissionsProfiles . gp_render_related_pages($key);
    } elseif ($key === 'mairie-infra') {
        $below = $mairieInfraProfiles . gp_render_related_pages($key);
    } elseif ($key === 'mairie-technique') {
        $below = $mairieTechniqueProfiles . gp_render_related_pages($key);
    } elseif ($two) {
        $aside = '<aside class="reveal">' . implode('', $cards) . '</aside>';
        $below = gp_render_related_pages($key);
    } else {
        $below = gp_render_related_pages($key);
    }

    return '<section class="page-hero"><div class="page-hero-shell"><div>' . gp_breadcrumb($key, $title) . '<h1>' . gp_h($title) . '</h1><p class="lead">' . gp_h($lead) . '</p><div class="hero-actions"><a class="primary-action" href="/contact">Contacter le service</a><a class="ghost-action" href="/mes-demarches-en-ligne">Voir l&#039;e-guichet</a></div></div><figure class="page-hero-image"><img src="' . gp_h($image) . '" alt=""></figure></div></section><section class="section"><div class="container"><div class="page-content-grid' . ($two ? ' is-two-columns' : '') . '"><article class="reveal">' . implode('', $prose) . $form . '</article>' . $aside . '</div>' . $below . '</div></section>';
}

function gp_render_contact(): string
{
    $email = gp_h((string) gp_config('contact.email', 'contact@mairiegrandpopo.bj'));
    $phone = gp_h((string) gp_config('contact.phone', '+229 0197386269'));
    $addr = gp_h((string) gp_config('contact.address', 'Centre ville Grand-Popo'));

    return '<section class="page-hero"><div class="page-hero-shell"><div>'
        . gp_breadcrumb('contact', 'Contact')
        . '<h1>Ecrire a la mairie</h1><p class="lead">Nous sommes a votre ecoute pour vos questions et vos demarches.</p></div>'
        . '<figure class="page-hero-image"><img src="' . gp_h(gp_media_url('/assets/facade.jpg')) . '" alt="Contact"></figure></div></section>'
        . '<section class="section"><div class="container"><div class="contact-grid">'
        . '<div class="contact-cards reveal">'
        . '<article class="contact-card"><span class="ico">@</span><div><div class="label">Email</div><div class="value">' . $email . '</div></div></article>'
        . '<article class="contact-card"><span class="ico">?</span><div><div class="label">Telephone</div><div class="value">' . $phone . '</div></div></article>'
        . '<article class="contact-card"><span class="ico">?</span><div><div class="label">Adresse</div><div class="value">' . $addr . '</div></div></article>'
        . '</div>'
        . '<form class="request-form reveal" method="post" action="/contact">'
        . '<div class="row"><label>Nom complet<input type="text" name="nom" required></label><label>Email<input type="email" name="email" required></label></div>'
        . '<div class="row"><label>Telephone<input type="tel" name="telephone" required></label><label>Objet<input type="text" name="objet" required></label></div>'
        . '<label>Message<textarea name="message" rows="8" required></textarea></label>'
        . '<button class="primary-action" type="submit">Envoyer le message</button>'
        . '</form></div></div></section>';
}

function gp_render_mentions(): string
{
    return '<section class="page-hero"><div class="page-hero-shell"><div>'
        . gp_breadcrumb('mentions', 'Mentions legales')
        . '<h1>Mentions legales</h1><p class="lead">Informations legales du portail communal.</p></div>'
        . '<figure class="page-hero-image"><img src="' . gp_h(gp_media_url('/assets/facade.jpg')) . '" alt="Mentions"></figure></div></section>'
        . '<section class="section"><div class="container"><article class="prose reveal">'
        . '<h3>Editeur</h3><p>Mairie de Grand-Popo</p>'
        . '<h3>Contact</h3><p>Email: ' . gp_h((string) gp_config('contact.email', 'contact@mairiegrandpopo.bj')) . '<br>Telephone: ' . gp_h((string) gp_config('contact.phone', '+229 0197386269')) . '</p>'
        . '<h3>Politique de confidentialite</h3><p>Les donnees recueillies servent uniquement au traitement de vos demandes citoyennes.</p>'
        . '</article></div></section>';
}

function gp_render_demande_page(): string
{
    $catalog = gp_services_catalog();
    $categories = array_values((array) ($catalog['categories'] ?? []));
    $wantedService = gp_fix_text((string) ($_GET['service'] ?? ''));

    $options = [];
    foreach ($categories as $cat) {
        $slug = (string) ($cat['slug'] ?? '');
        $label = gp_clean_menu_text((string) ($cat['label'] ?? $slug));
        foreach ((array) ($cat['services'] ?? []) as $svc) {
            $name = gp_clean_menu_text((string) ($svc['name'] ?? $svc['title'] ?? 'Service'));
            $selected = $wantedService !== '' && mb_strtolower($wantedService) === mb_strtolower($name);
            $options[] = '<option value="' . gp_h($name) . '" data-category="' . gp_h($slug) . '"' . ($selected ? ' selected' : '') . '>' . gp_h($name . ' - ' . $label) . '</option>';
        }
    }
    if ($options === []) {
        $options[] = '<option value="">Aucun service disponible</option>';
    }

    $json = gp_h(json_encode(['categories' => $categories], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

    return '<section class="page-hero"><div class="page-hero-shell"><div>'
        . gp_breadcrumb('services-demande', 'Demande de service')
        . '<h1>Demande de service en ligne</h1><p class="lead">Choisissez un service et envoyez votre dossier.</p></div>'
        . '<figure class="page-hero-image"><img src="' . gp_h(gp_media_url('/assets/facade.jpg')) . '" alt="Demande"></figure></div></section>'
        . '<section class="section"><div class="container"><div class="form-grid">'
        . '<div class="form-intro reveal"><p class="eyebrow">E-guichet</p><h2 data-service-title>Selectionnez un service</h2><p data-service-summary>Choisissez un service pour afficher les details et pieces a joindre.</p>'
        . '<div class="info-card"><h4>Tarif indicatif</h4><p data-service-price-preview>A definir selon le service</p><h4>Documents requis</h4><p data-service-docs-preview>au moins un justificatif</p></div></div>'
        . '<form class="request-form reveal" method="post" action="/demande" data-service-request-form>'
        . '<input type="hidden" name="category" value="" data-service-category>'
        . '<div class="row"><label>Nom complet<input type="text" name="nom" required></label><label>Email<input type="email" name="email" required></label></div>'
        . '<div class="row"><label>Telephone<input type="tel" name="telephone" required></label><label>Service<select name="service" required data-service-select>' . implode('', $options) . '</select></label></div>'
        . '<label>Description du service<textarea name="service_description" rows="4" readonly data-service-description></textarea></label>'
        . '<div class="row"><label>Pieces a joindre<textarea name="service_documents" rows="4" readonly data-service-documents></textarea></label><label>Prix<input type="text" name="service_price" readonly data-service-price></label></div>'
        . '<p class="meta" data-docs-note>Ajoutez au minimum un justificatif.</p>'
        . '<label>Piece 1<input type="file" name="piece_1" data-service-file required></label>'
        . '<label>Piece 2<input type="file" name="piece_2" data-service-file></label>'
        . '<label>Piece 3<input type="file" name="piece_3" data-service-file></label>'
        . '<label>Message complementaire<textarea name="message" rows="6"></textarea></label>'
        . '<button class="primary-action" type="submit">Envoyer la demande</button>'
        . '</form></div></div><script id="services-catalog-data" type="application/json">' . $json . '</script></section>';
}

function gp_render_blog_index(array $posts): string
{
    $cards = [];
    foreach ($posts as $post) {
        $slug = (string) ($post['slug'] ?? '');
        $cards[] = '<article class="eael-grid-post reveal"><div class="eael-grid-post-holder"><div class="eael-grid-post-holder-inner">'
            . '<a class="eael-entry-thumbnail" href="/blog/' . gp_h($slug) . '"><img src="' . gp_h(gp_media_url((string) ($post['image'] ?? '/assets/gbekon.jpg'))) . '" alt=""></a>'
            . '<div class="eael-entry-wrapper"><h3 class="eael-entry-title"><a href="/blog/' . gp_h($slug) . '">' . gp_h(gp_clean_menu_text((string) ($post['title'] ?? 'Article'))) . '</a></h3>'
            . '<div class="eael-entry-meta"><span>' . gp_h((string) ($post['published_at'] ?? '')) . '</span></div>'
            . '<div class="eael-entry-content"><div class="eael-grid-post-excerpt"><p>' . gp_h(gp_excerpt(gp_clean_menu_text((string) ($post['excerpt'] ?? '')), 180)) . '</p><a class="eael-post-elements-readmore-btn" href="/blog/' . gp_h($slug) . '">Lire plus</a></div></div></div></div></div></article>';
    }

    return '<section class="page-hero"><div class="page-hero-shell"><div>'
        . '<nav class="breadcrumb"><a href="/">Accueil</a><span class="sep">/</span><span class="current">Blog</span></nav>'
        . '<h1>Blog communal</h1><p class="lead">Actualites et informations officielles de la commune.</p></div>'
        . '<figure class="page-hero-image"><img src="' . gp_h(gp_media_url('/assets/gbekon.jpg')) . '" alt="Blog"></figure></div></section>'
        . '<section class="section"><div class="container"><div class="page-content-grid"><article class="prose"><div class="eael-post-grid-container"><div class="eael-post-grid">'
        . implode('', $cards)
        . '</div></div></article></div></div></section>';
}

function gp_render_blog_article(array $post): string
{
    $title = gp_clean_menu_text((string) ($post['title'] ?? 'Article'));
    $img = gp_media_url((string) ($post['image'] ?? '/assets/facade.jpg'));
    $content = gp_repair_mojibake_text((string) ($post['content'] ?? ''));
    $content = preg_replace_callback('/\b(src|href)=("|\')(?!https?:\/\/|\/|#|mailto:|tel:)([^"\']+)\2/i', static fn($m) => $m[1] . '=' . $m[2] . '/' . ltrim($m[3], '/') . $m[2], $content) ?? $content;

    return '<section class="page-hero"><div class="page-hero-shell"><div>'
        . '<nav class="breadcrumb"><a href="/">Accueil</a><span class="sep">/</span><a href="/blog">Blog</a><span class="sep">/</span><span class="current">' . gp_h($title) . '</span></nav>'
        . '<h1>' . gp_h($title) . '</h1><p class="lead">' . gp_h((string) ($post['published_at'] ?? '')) . '</p></div>'
        . '<figure class="page-hero-image"><img src="' . gp_h($img) . '" alt=""></figure></div></section>'
        . '<section class="section"><div class="container"><article class="prose reveal">' . $content . '<p><a class="text-link" href="/blog">Retour au blog</a></p></article></div></section>';
}

function gp_render_forum_flash(): string
{
    $flash = gp_flash_get('forum');
    if (!$flash) {
        return '';
    }
    $class = (($flash['type'] ?? 'success') === 'error') ? ' is-error' : ' is-success';
    return '<div class="forum-alert' . $class . '">' . gp_h(gp_clean_menu_text((string) ($flash['message'] ?? ''))) . '</div>';
}

function gp_render_forum_index(array $page, bool $showComposer = false): string
{
    $topics = gp_forum_topics(60);
    $counts = gp_forum_total_counts();
    $user = gp_forum_user();

    $cards = [];
    foreach ($topics as $topic) {
        $cards[] = '<article class="forum-topic-card reveal"><h3><a href="/forums-de-discussion/sujet/' . (int) ($topic['id'] ?? 0) . '">' . gp_h(gp_clean_menu_text((string) ($topic['title'] ?? 'Sujet'))) . '</a></h3><p>' . gp_h(gp_excerpt(gp_clean_menu_text((string) ($topic['body'] ?? '')), 180)) . '</p><div class="forum-topic-meta"><span>Auteur: ' . gp_h((string) ($topic['author_name'] ?? 'Citoyen')) . '</span><span>Reponses: ' . (int) ($topic['replies_count'] ?? 0) . '</span></div></article>';
    }
    if ($cards === []) {
        $cards[] = '<div class="forum-empty"><h3>Aucun sujet</h3><p>Soyez le premier a publier.</p></div>';
    }

    $composer = '';
    if ($showComposer) {
        if ($user) {
            $composer = '<section class="forum-composer reveal"><div><p class="eyebrow">Nouveau sujet</p><h2>Publier une discussion</h2></div><form method="post" action="/forums-de-discussion/nouveau" class="bbp-login-form"><input type="hidden" name="action" value="forum_new_topic"><input type="hidden" name="csrf" value="' . gp_h(gp_csrf_token()) . '"><label>Titre<input type="text" name="title" minlength="6" required></label><label>Message<textarea name="body" rows="7" minlength="10" required></textarea></label><button type="submit">Publier le sujet</button></form></section>';
        } else {
            $composer = '<div class="forum-login-note"><p>Connectez-vous pour publier un sujet.</p><a class="primary-action sm" href="/connexion-aux-forums?next=/forums-de-discussion/nouveau">Se connecter</a></div>';
        }
    }

    $logout = $user ? '<form method="post" action="/forums-de-discussion" class="forum-inline-form"><input type="hidden" name="action" value="forum_logout"><input type="hidden" name="csrf" value="' . gp_h(gp_csrf_token()) . '"><button class="ghost-action" type="submit">Se deconnecter (' . gp_h((string) ($user['username'] ?? '')) . ')</button></form>' : '<a class="ghost-action" href="/connexion-aux-forums?next=/forums-de-discussion">Connexion</a>';

    return gp_render_forum_flash()
        . '<section class="page-hero"><div class="page-hero-shell"><div><nav class="breadcrumb"><a href="/">Accueil</a><span class="sep">/</span><span class="current">Forums</span></nav><h1>' . gp_h(gp_clean_menu_text((string) ($page['title'] ?? 'Forums de discussion'))) . '</h1><p class="lead">' . gp_h(gp_clean_menu_text((string) ($page['lead'] ?? 'Espace d\'echanges citoyens'))) . '</p><p class="forum-counter">' . (int) ($counts['topics'] ?? 0) . ' sujet(s) - ' . (int) ($counts['messages'] ?? 0) . ' message(s)</p><div class="hero-actions"><a class="primary-action" href="/forums-de-discussion/nouveau">Nouveau sujet</a>' . $logout . '</div></div><figure class="page-hero-image"><img src="' . gp_h(gp_media_url('/assets/facade.jpg')) . '" alt=""></figure></div></section>'
        . '<section class="section"><div class="container">' . $composer . '<div class="forum-topics">' . implode('', $cards) . '</div></div></section>';
}

function gp_render_forum_topic_page(array $page, array $topic): string
{
    $title = gp_clean_menu_text((string) ($topic['title'] ?? 'Sujet'));
    $body = nl2br(gp_h(gp_clean_menu_text((string) ($topic['body'] ?? ''))));
    $author = gp_h((string) ($topic['author_name'] ?? 'Citoyen'));
    $postsHtml = [];
    foreach ((array) ($topic['posts'] ?? []) as $post) {
        $postsHtml[] = '<article class="forum-post reveal"><header><strong>' . gp_h((string) ($post['author_name'] ?? 'Citoyen')) . '</strong><span>' . gp_h((string) ($post['created_at'] ?? '')) . '</span></header><p>' . nl2br(gp_h(gp_clean_menu_text((string) ($post['body'] ?? '')))) . '</p></article>';
    }
    if ($postsHtml === []) {
        $postsHtml[] = '<div class="forum-empty"><h3>Aucune reponse</h3><p>Soyez le premier a repondre.</p></div>';
    }

    $user = gp_forum_user();
    $reply = $user
        ? '<form class="bbp-login-form forum-reply-form" method="post" action="/forums-de-discussion/sujet/' . (int) ($topic['id'] ?? 0) . '"><input type="hidden" name="action" value="forum_reply"><input type="hidden" name="topic_id" value="' . (int) ($topic['id'] ?? 0) . '"><input type="hidden" name="csrf" value="' . gp_h(gp_csrf_token()) . '"><label>Votre reponse<textarea name="body" rows="6" required></textarea></label><button type="submit">Publier la reponse</button></form>'
        : '<div class="forum-login-note"><p>Connectez-vous pour repondre.</p><a class="primary-action sm" href="/connexion-aux-forums?next=/forums-de-discussion/sujet/' . (int) ($topic['id'] ?? 0) . '">Se connecter</a></div>';

    return gp_render_forum_flash()
        . '<section class="page-hero"><div class="page-hero-shell"><div><nav class="breadcrumb"><a href="/">Accueil</a><span class="sep">/</span><a href="/forums-de-discussion">Forums</a><span class="sep">/</span><span class="current">' . gp_h($title) . '</span></nav><h1>' . gp_h($title) . '</h1></div><figure class="page-hero-image"><img src="' . gp_h(gp_media_url('/assets/facade.jpg')) . '" alt=""></figure></div></section>'
        . '<section class="section"><div class="container"><article class="forum-post is-topic reveal"><header><strong>' . $author . '</strong><span>' . gp_h((string) ($topic['created_at'] ?? '')) . '</span></header><p>' . $body . '</p></article><div class="forum-replies" id="reponses"><h2>Reponses</h2>' . implode('', $postsHtml) . $reply . '</div></div></section>';
}

function gp_render_forum_login_page(array $page): string
{
    $next = gp_forum_sanitize_redirect($_GET['next'] ?? '', gp_forum_default_redirect());
    return gp_render_forum_flash() . '<section class="page-hero"><div class="page-hero-shell"><div><nav class="breadcrumb"><a href="/">Accueil</a><span class="sep">/</span><a href="/forums-de-discussion">Forums</a><span class="sep">/</span><span class="current">Connexion</span></nav><h1>' . gp_h(gp_clean_menu_text((string) ($page['title'] ?? 'Connexion'))) . '</h1><p class="lead">' . gp_h(gp_clean_menu_text((string) ($page['lead'] ?? 'Connectez-vous a votre compte'))) . '</p></div><figure class="page-hero-image"><img src="' . gp_h(gp_media_url('/assets/facade.jpg')) . '" alt=""></figure></div></section><section class="section"><div class="container"><div class="forum-auth-wrap"><form class="bbp-login-form reveal" method="post" action="/connexion-aux-forums"><input type="hidden" name="action" value="forum_login"><input type="hidden" name="csrf" value="' . gp_h(gp_csrf_token()) . '"><input type="hidden" name="next" value="' . gp_h($next) . '"><label>Identifiant ou email<input type="text" name="identifier" required></label><label>Mot de passe<input type="password" name="password" required></label><button type="submit">Se connecter</button></form><div class="forum-login-note"><p>Pas encore de compte ?</p><a class="primary-action sm" href="/inscription-aux-forums?next=' . rawurlencode($next) . '">Creer un compte</a></div></div></div></section>';
}

function gp_render_forum_register_page(array $page): string
{
    $next = gp_forum_sanitize_redirect($_GET['next'] ?? '', gp_forum_default_redirect());
    $min = gp_forum_min_password_length();
    return gp_render_forum_flash() . '<section class="page-hero"><div class="page-hero-shell"><div><nav class="breadcrumb"><a href="/">Accueil</a><span class="sep">/</span><a href="/forums-de-discussion">Forums</a><span class="sep">/</span><span class="current">Inscription</span></nav><h1>' . gp_h(gp_clean_menu_text((string) ($page['title'] ?? 'Inscription'))) . '</h1><p class="lead">' . gp_h(gp_clean_menu_text((string) ($page['lead'] ?? 'Creer un compte forum'))) . '</p></div><figure class="page-hero-image"><img src="' . gp_h(gp_media_url('/assets/facade.jpg')) . '" alt=""></figure></div></section><section class="section"><div class="container"><div class="forum-auth-wrap"><form class="bbp-login-form reveal" method="post" action="/inscription-aux-forums"><input type="hidden" name="action" value="forum_register"><input type="hidden" name="csrf" value="' . gp_h(gp_csrf_token()) . '"><input type="hidden" name="next" value="' . gp_h($next) . '"><label>Identifiant<input type="text" name="username" minlength="3" required></label><label>Email<input type="email" name="email" required></label><div class="row"><label>Mot de passe<input type="password" name="password" minlength="' . $min . '" required></label><label>Confirmer mot de passe<input type="password" name="password_confirm" minlength="' . $min . '" required></label></div><button type="submit">Creer mon compte</button></form></div></div></section>';
}









