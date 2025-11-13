FROM httpd

COPY index.html /usr/local/apache2/htdocs/index.html

COPY styles.css /usr/local/apache2/htdocs/styles.css

EXPOSE 80   

CMD ["httpd-foreground"]

# This Dockerfile uses the official Apache HTTP Server image as a base.