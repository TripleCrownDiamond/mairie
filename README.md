# Mairie de Grand-Popo

Version PHP/JS + SQLite du portail, avec routes propres, SEO, carrousel hero et admin de contenu.

## Lancement local

```bash
php -S 127.0.0.1:8000 router.php
```

Puis ouvrir `http://127.0.0.1:8000`.

## Admin

- URL: `/admin`
- Utilisateur: `admin`
- Mot de passe initial: `grand-popo`
- Pour le changer: variable d’environnement `GRAND_POPO_ADMIN_PASSWORD`

## Structure

- `index.php` : front controller public
- `admin/index.php` : interface d’administration pour le hero, les slides et les pages
- `app/bootstrap.php` : DB, routes, helpers
- `uploads/hero` et `uploads/pages` : images téléversées depuis l’admin
- `app/views.php` : rendu HTML
- `data/site-data.json` : données du site source
- `assets/css/site.css` : surcouche visuelle
- `assets/js/site.js` : carrousel et navigation
- `storage/` : base SQLite

