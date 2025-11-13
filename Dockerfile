FROM httpd

COPY index.html /usr/local/apache2/htdocs/index.html

EXPOSE 80   

CMD ["httpd-foreground"]

# This Dockerfile uses the official Apache HTTP Server image as a base.