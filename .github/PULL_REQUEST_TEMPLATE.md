<!-- Short description of the thing you're adding/fixing. Link to any issues. -->

## Example

**Input:**
```yaml
nginx:
    ports:
        - '80:80'
    volumes:
        - '/var/run/docker.sock:/tmp/docker.sock:ro'
    image: nginx
```
**Output:**
```yaml
<!-- Paste the output of the above in here -->
```

## Relevant Docker Documentation

<!-- Please link to the source of truth for how the option should behave, according to the official Docker documentation -->

**Docker CLI:** <!-- Link to the subheading of the option on https://docs.docker.com/engine/reference/commandline/run -->
**Docker Compose:** <!-- Link to the subheading of the option on https://docs.docker.com/compose/compose-file -->

## Checklist

- [ ] Added a test to cover this behaviour
- [ ] Verified this using the deploy preview
- [ ] Behaves according the documentation pasted above