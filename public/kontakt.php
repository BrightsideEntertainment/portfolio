<?php
/**
 * Kontaktformular: prüft die Eingaben, speichert die Anfrage (falls DB eingerichtet)
 * und schickt eine Mail an CONTACT_MAIL. Antwortet als JSON (fetch) oder als einfache Seite.
 */
declare(strict_types=1);

$wantsJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');

function respond(bool $ok, string $msg, bool $json, int $code = 200): void
{
    http_response_code($code);
    if ($json) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    } else {
        header('Content-Type: text/html; charset=utf-8');
        $text = htmlspecialchars($ok ? 'Danke! Ihre Anfrage ist angekommen.' : $msg, ENT_QUOTES, 'UTF-8');
        echo "<!doctype html><meta charset='utf-8'><title>Kontakt</title><p>{$text}</p><p><a href='./#kontakt'>Zurück</a></p>";
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Nur Formular-Anfragen sind erlaubt.', $wantsJson, 405);
}

// Honeypot: Bots füllen dieses Feld aus, Menschen sehen es nicht
if (!empty($_POST['website'])) {
    respond(true, '', $wantsJson);
}

$name    = trim((string)($_POST['name'] ?? ''));
$email   = trim((string)($_POST['email'] ?? ''));
$subject = trim((string)($_POST['subject'] ?? 'Anfrage'));
$body    = trim((string)($_POST['body'] ?? ''));

if (mb_strlen($name) < 2 || mb_strlen($name) > 120) {
    respond(false, 'Bitte geben Sie Ihren Namen an.', $wantsJson, 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 180) {
    respond(false, 'Bitte prüfen Sie die E-Mail-Adresse.', $wantsJson, 422);
}
if (mb_strlen($body) < 10 || mb_strlen($body) > 4000) {
    respond(false, 'Die Nachricht ist zu kurz oder zu lang.', $wantsJson, 422);
}
$allowed = ['Moderation', 'Podcast', 'Film / Reels', 'Etwas anderes'];
if (!in_array($subject, $allowed, true)) {
    $subject = 'Etwas anderes';
}

$configFile = __DIR__ . '/includes/config.php';
if (!is_file($configFile)) {
    respond(false, 'Das Formular ist noch nicht eingerichtet.', $wantsJson, 503);
}
require_once $configFile;

$saved = false;
$mailed = false;

// 1. In der Datenbank speichern (wenn vorhanden)
try {
    require_once __DIR__ . '/includes/db.php';
    $stmt = db()->prepare('INSERT INTO messages (name, email, subject, body) VALUES (?, ?, ?, ?)');
    $stmt->execute([$name, $email, $subject, $body]);
    $saved = true;
} catch (Throwable $e) {
    error_log('Kontakt: DB-Fehler: ' . $e->getMessage());
}

// 2. Benachrichtigung per Mail
if (defined('CONTACT_MAIL') && filter_var(CONTACT_MAIL, FILTER_VALIDATE_EMAIL)) {
    $clean = static fn(string $s): string => str_replace(["\r", "\n"], ' ', $s);
    $headers = [
        'From: Portfolio <' . CONTACT_MAIL . '>',
        'Reply-To: ' . $clean($name) . ' <' . $clean($email) . '>',
        'Content-Type: text/plain; charset=utf-8',
    ];
    $text = "Neue Anfrage über das Portfolio\n\nName: {$name}\nE-Mail: {$email}\nThema: {$subject}\n\n{$body}\n";
    $mailed = mail(CONTACT_MAIL, '=?UTF-8?B?' . base64_encode('Anfrage: ' . $subject) . '?=', $text, implode("\r\n", $headers));
}

if (!$saved && !$mailed) {
    respond(false, 'Die Anfrage konnte nicht gesendet werden.', $wantsJson, 500);
}
respond(true, '', $wantsJson);
