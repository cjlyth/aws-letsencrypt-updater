# Use an official Python runtime as a parent image
FROM certbot/dns-route53:v1.3.0

CMD ["certonly", "-d", "chrislyth.io", "-d", "*.chrislyth.io", "--agree-tos", "--non-interactive", "--dns-route53", "-m", "cjlyth@gmail.com", "--server", "https://acme-v02.api.letsencrypt.org/directory"]