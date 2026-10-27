UPDATE courses
SET body = json_set(
      body,
      '$[0].lessons[0].materials[0].url',
      '/materials/portfolio-phishing-2026.pdf'
    ),
    updated = CURRENT_TIMESTAMP
WHERE id = 'cyber-pilot'
  AND json_valid(body)
  AND json_extract(body, '$[0].lessons[0].materials[0].url') = '/materiais/portfolio-phishing-2026.pdf';
