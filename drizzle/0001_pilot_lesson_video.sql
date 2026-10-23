UPDATE courses
SET body = json_set(body, '$[0].lessons[0].video', 'static:aula-01-calma-dedo-nervoso.mp4'),
    updated = CURRENT_TIMESTAMP
WHERE id = 'cyber-pilot'
  AND json_valid(body)
  AND json_extract(body, '$[0].lessons[0].video') = '';
