<?php
declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/views.php';

gp_boot_session();

$path = gp_request_path();
$data = gp_data();

$getPage = static function (string $pageKey) use ($data): ?array {
    $page = $data['PAGES'][$pageKey] ?? null;
    $runtimePage = gp_runtime_page($pageKey);

    if (is_array($runtimePage)) {
        if (!is_array($page)) {
            $page = $runtimePage;
        } else {
            $page = array_replace_recursive($page, $runtimePage);
        }
    }

    if (!is_array($page) || $page === []) {
        return null;
    }

    $override = gp_page_override($pageKey);
    if ($override) {
        foreach (['title', 'lead', 'image', 'custom_html', 'seo_title', 'seo_description'] as $field) {
            if (!empty($override[$field])) {
                $page[$field] = $override[$field];
            }
        }
        if ($override['show_form'] !== null) {
            $page['showForm'] = (int) $override['show_form'] === 1;
        }
    }

    return $page;
};

$redirect = static function (string $to): never {
    header('Location: ' . $to, true, 303);
    exit;
};

if ($path === '/mairie/mot-du-maire') {
    $redirect('/#mot-du-maire');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = trim((string) ($_POST['action'] ?? ''));

    if (str_starts_with($action, 'forum_')) {
        if (!gp_verify_csrf($_POST['csrf'] ?? null)) {
            gp_flash_set('forum', 'Session invalide. Veuillez reessayer.', 'error');
            $redirect('/forums-de-discussion');
        }

        if ($action === 'forum_login') {
            $identifier = trim((string) ($_POST['identifier'] ?? ''));
            $password = (string) ($_POST['password'] ?? '');
            $next = gp_forum_sanitize_redirect($_POST['next'] ?? '', gp_forum_default_redirect());

            if (gp_forum_login($identifier, $password)) {
                gp_flash_set('forum', 'Connexion reussie. Bienvenue.', 'success');
                $redirect($next);
            }

            gp_flash_set('forum', 'Identifiants invalides.', 'error');
            $redirect('/connexion-aux-forums?next=' . rawurlencode($next));
        }

        if ($action === 'forum_register') {
            $username = trim((string) ($_POST['username'] ?? ''));
            $email = trim((string) ($_POST['email'] ?? ''));
            $password = (string) ($_POST['password'] ?? '');
            $confirm = (string) ($_POST['password_confirm'] ?? '');
            $next = gp_forum_sanitize_redirect($_POST['next'] ?? '', gp_forum_default_redirect());

            if ($password !== $confirm) {
                gp_flash_set('forum', 'Les mots de passe ne correspondent pas.', 'error');
                $redirect('/inscription-aux-forums?next=' . rawurlencode($next));
            }

            $registered = gp_forum_register($username, $email, $password);
            if (!empty($registered['ok'])) {
                gp_flash_set('forum', 'Compte cree avec succes.', 'success');
                $redirect($next);
            }

            gp_flash_set('forum', (string) ($registered['error'] ?? 'Inscription impossible.'), 'error');
            $redirect('/inscription-aux-forums?next=' . rawurlencode($next));
        }

        if ($action === 'forum_logout') {
            gp_forum_logout();
            gp_flash_set('forum', 'Deconnexion effectuee.', 'success');
            $redirect('/forums-de-discussion');
        }

        if ($action === 'forum_new_topic') {
            $user = gp_forum_user();
            if (!$user) {
                gp_flash_set('forum', 'Connexion requise pour publier un sujet.', 'error');
                $redirect('/connexion-aux-forums?next=' . rawurlencode('/forums-de-discussion/nouveau'));
            }

            $topicId = gp_forum_create_topic((int) $user['id'], (string) ($_POST['title'] ?? ''), (string) ($_POST['body'] ?? ''));
            if ($topicId > 0) {
                gp_flash_set('forum', 'Sujet publie avec succes.', 'success');
                $redirect('/forums-de-discussion/sujet/' . $topicId);
            }

            gp_flash_set('forum', 'Le sujet est invalide. Merci de completer le titre et le message.', 'error');
            $redirect('/forums-de-discussion/nouveau');
        }

        if ($action === 'forum_reply') {
            $user = gp_forum_user();
            $topicId = (int) ($_POST['topic_id'] ?? 0);
            if (!$user) {
                gp_flash_set('forum', 'Connexion requise pour repondre.', 'error');
                $redirect('/connexion-aux-forums?next=' . rawurlencode('/forums-de-discussion/sujet/' . $topicId));
            }

            if ($topicId <= 0 || !gp_forum_add_post($topicId, (int) $user['id'], (string) ($_POST['body'] ?? ''))) {
                gp_flash_set('forum', 'Impossible de publier la reponse.', 'error');
                $redirect('/forums-de-discussion/sujet/' . max(1, $topicId));
            }

            gp_flash_set('forum', 'Reponse publiee.', 'success');
            $redirect('/forums-de-discussion/sujet/' . $topicId . '#reponses');
        }
    }
}

if ($path === '/blog') {
    gp_sync_blog_posts();
    $posts = gp_blog_posts(24, 0);
    $body = gp_render_blog_index($posts);
    $title = 'Blog - ' . gp_site_name();
    $desc = 'Actualites et informations officielles de la commune de Grand-Popo.';
    $ogImage = !empty($posts[0]['image']) ? (string) $posts[0]['image'] : '/assets/facade.jpg';
    gp_render_layout($title, $desc, $body, 'blog', gp_site_url() . '/blog', $ogImage);
    return;
}

if (preg_match('#^/blog/([a-z0-9-]+)$#i', $path, $m) === 1) {
    gp_sync_blog_posts();
    $slug = strtolower((string) $m[1]);
    $post = gp_blog_post_by_slug($slug);

    if (!$post) {
        http_response_code(404);
        $body = '<section class="section"><div class="container"><div class="prose"><p class="eyebrow">404</p><h1>Article introuvable</h1><p>L\'article demande n\'existe pas ou n\'est plus disponible.</p><p><a class="primary-action" href="/blog">Retour au blog</a></p></div></div></section>';
        gp_render_layout('Article introuvable - ' . gp_site_name(), 'Article introuvable.', $body, 'blog', gp_site_url() . $path, '/assets/facade.jpg');
        return;
    }

    $body = gp_render_blog_article($post);
    $title = trim((string) ($post['title'] ?? 'Article')) . ' - ' . gp_site_name();
    $desc = gp_excerpt((string) ($post['excerpt'] ?? ''), 170);
    if ($desc === '') {
        $desc = 'Article du blog communal de Grand-Popo.';
    }
    $ogImage = (string) ($post['image'] ?? '/assets/facade.jpg');
    gp_render_layout($title, $desc, $body, 'blog', gp_site_url() . $path, $ogImage);
    return;
}

$forumHomePaths = ['/forums-de-discussion', '/citoyen/forums'];
$forumLoginPaths = ['/connexion-aux-forums', '/citoyen/forums/connexion'];
$forumRegisterPaths = ['/inscription-aux-forums', '/citoyen/forums/inscription'];
$forumNewPaths = ['/forums-de-discussion/nouveau', '/citoyen/forums/nouveau'];

if (in_array($path, $forumHomePaths, true) || in_array($path, $forumNewPaths, true)) {
    $page = $getPage('citoyen-forums') ?? [
        'title' => 'Forums de discussion',
        'lead' => 'Espace d echanges citoyens',
    ];

    $body = gp_render_forum_index($page, in_array($path, $forumNewPaths, true));
    $title = (($page['seo_title'] ?? '') !== '' ? (string) $page['seo_title'] : ((string) ($page['title'] ?? 'Forums') . ' - ' . gp_site_name()));
    $desc = (($page['seo_description'] ?? '') !== '' ? (string) $page['seo_description'] : gp_excerpt((string) ($page['lead'] ?? 'Forums citoyens'), 160));
    gp_render_layout($title, $desc, $body, 'citoyen-forums', gp_site_url() . $path, '/assets/facade.jpg');
    return;
}

if (preg_match('#^/(?:forums-de-discussion|citoyen/forums)/sujet/(\d+)$#', $path, $m) === 1) {
    $topicId = (int) $m[1];
    $topic = gp_forum_topic($topicId);
    if (!$topic) {
        http_response_code(404);
        $body = '<section class="section"><div class="container"><div class="prose"><p class="eyebrow">404</p><h1>Sujet introuvable</h1><p>Ce sujet n existe pas ou a ete supprime.</p><p><a class="primary-action" href="/forums-de-discussion">Retour aux forums</a></p></div></div></section>';
        gp_render_layout('Sujet introuvable - ' . gp_site_name(), 'Sujet introuvable.', $body, 'citoyen-forums', gp_site_url() . $path, '/assets/facade.jpg');
        return;
    }

    $page = $getPage('citoyen-forums') ?? ['title' => 'Forums de discussion'];
    $body = gp_render_forum_topic_page($page, $topic);
    $title = trim((string) ($topic['title'] ?? 'Sujet')) . ' - ' . gp_site_name();
    $desc = gp_excerpt((string) ($topic['body'] ?? ''), 165);
    gp_render_layout($title, $desc !== '' ? $desc : 'Discussion citoyenne', $body, 'citoyen-forums', gp_site_url() . $path, '/assets/facade.jpg');
    return;
}

if (in_array($path, $forumLoginPaths, true)) {
    $page = $getPage('citoyen-forums-connexion') ?? [
        'title' => 'Connexion aux forums',
        'lead' => 'Connectez-vous a votre compte',
    ];
    $body = gp_render_forum_login_page($page);
    $title = (($page['seo_title'] ?? '') !== '' ? (string) $page['seo_title'] : ((string) ($page['title'] ?? 'Connexion') . ' - ' . gp_site_name()));
    $desc = (($page['seo_description'] ?? '') !== '' ? (string) $page['seo_description'] : gp_excerpt((string) ($page['lead'] ?? 'Connexion forum'), 160));
    gp_render_layout($title, $desc, $body, 'citoyen-forums-connexion', gp_site_url() . $path, '/assets/facade.jpg');
    return;
}

if (in_array($path, $forumRegisterPaths, true)) {
    $page = $getPage('citoyen-forums-inscription') ?? [
        'title' => 'Inscription aux forums',
        'lead' => 'Creer un compte forum',
    ];
    $body = gp_render_forum_register_page($page);
    $title = (($page['seo_title'] ?? '') !== '' ? (string) $page['seo_title'] : ((string) ($page['title'] ?? 'Inscription') . ' - ' . gp_site_name()));
    $desc = (($page['seo_description'] ?? '') !== '' ? (string) $page['seo_description'] : gp_excerpt((string) ($page['lead'] ?? 'Inscription forum'), 160));
    gp_render_layout($title, $desc, $body, 'citoyen-forums-inscription', gp_site_url() . $path, '/assets/facade.jpg');
    return;
}

$key = gp_current_key($path);
$page = $getPage($key);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $kind = $path === '/contact' ? 'contact' : ($path === '/demande' ? 'service-request' : 'request');
    if ($path === '/contact' || $path === '/demande' || (!empty($page) && !empty($page['showForm']))) {
        gp_db()->prepare('INSERT INTO inquiries (kind, payload) VALUES (?, ?)')->execute([
            $kind,
            json_encode($_POST, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
        header('Location: ' . $path . '?sent=1', true, 303);
        exit;
    }
}

if ($key === 'home') {
    gp_sync_blog_posts();
    $slides = gp_home_hero_slides();
    $blogPosts = gp_blog_posts(4, 0);
    $body = gp_render_home($data, $slides, $key, $blogPosts);
    $title = gp_site_name() . ' - Portail citoyen';
    $desc = 'Portail officiel de la Mairie de Grand-Popo.';
    gp_render_layout($title, $desc, $body, $key, gp_site_url() . '/', $slides[0]['image'] ?? '/assets/logo-gp.jpg');
    return;
}

if ($key === 'contact') {
    $body = gp_render_contact();
    $title = 'Contact - ' . gp_site_name();
    $desc = 'Contactez la mairie de Grand-Popo pour vos demarches, questions et signalements.';
    gp_render_layout($title, $desc, $body, $key, gp_site_url() . '/contact', '/assets/facade.jpg');
    return;
}

if ($key === 'mentions') {
    $body = gp_render_mentions();
    $title = 'Mentions legales - ' . gp_site_name();
    $desc = 'Mentions legales, donnees personnelles et informations de publication du site de la mairie de Grand-Popo.';
    gp_render_layout($title, $desc, $body, $key, gp_site_url() . '/mentions-legales', '/assets/facade.jpg');
    return;
}

if ($key === 'services-demande') {
    $body = gp_render_demande_page();
    $title = 'Demande de service - ' . gp_site_name();
    $desc = 'Soumettez votre demande en ligne avec un formulaire dynamique selon le service choisi.';
    gp_render_layout($title, $desc, $body, $key, gp_site_url() . '/demande', '/assets/facade.jpg');
    return;
}

if (!$page) {
    http_response_code(404);
    $body = '<section class="section"><div class="container"><div class="prose"><p class="eyebrow">404</p><h1>Page introuvable</h1><p>La page demandee n\'existe pas ou a ete deplacee.</p><p><a class="primary-action" href="/">Retour a l\'accueil</a></p></div></div></section>';
    gp_render_layout('404 - ' . gp_site_name(), 'Page introuvable.', $body, 'home', gp_site_url() . '/', '/assets/logo-gp.jpg');
    return;
}

$body = gp_render_page($key, $page);
$titleRaw = !empty($page['seo_title']) ? (string) $page['seo_title'] : ((string) ($page['title'] ?? 'Page') . ' - ' . gp_site_name());
$descRaw = !empty($page['seo_description']) ? (string) $page['seo_description'] : gp_excerpt((string) ($page['lead'] ?? ''), 160);
$title = gp_clean_menu_text($titleRaw);
$desc = gp_clean_menu_text($descRaw);
$ogImage = $page['image'] ?? '/assets/logo-gp.jpg';
gp_render_layout($title, $desc, $body, $key, gp_site_url() . gp_page_path($key), $ogImage);
