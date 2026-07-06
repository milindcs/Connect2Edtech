# TODO

- [ ] Investigate and remove/align any legacy CourseDetailPage implementation with current route `/course/:course`.
- [ ] Ensure all course links use `/course/${c.key}` and the details page reads the correct route param.
- [ ] If legacy component exists, update it to use `normalizeCourseKey(course)` and `useParams().course`.
- [ ] Run frontend build (and/or dev) to confirm no runtime errors.

