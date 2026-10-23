UPDATE courses
SET body = json_set(
      body,
      '$[0].lessons[0].materials',
      json_array(json_object(
        'title', 'Portfólio didático · Phishing nos dias atuais (PDF)',
        'url', '/materiais/portfolio-phishing-2026.pdf'
      ))
    ),
    updated = CURRENT_TIMESTAMP
WHERE id = 'cyber-pilot'
  AND json_valid(body)
  AND json_extract(body, '$[0].lessons[0].materials') IS NULL;
