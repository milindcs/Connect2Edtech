# TODO

- [x] Investigate and remove/align any legacy CourseDetailPage implementation with current route `/course/:course`.
- [x] Ensure all course links use `/course/${c.key}` and the details page reads the correct route param.
- [x] If legacy component exists, update it to use `normalizeCourseKey(course)` and `useParams().course`.
- [x] Run frontend build (and/or dev) to confirm no runtime errors.

