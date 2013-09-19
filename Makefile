domain=$(shell node domain.js)

all: ssl-cert.pem

ssl-key.pem:
	openssl genrsa -out ssl-key.pem 1024

ssl-csr.pem: ssl.cnf ssl-key.pem
	sed -i "" -e "s/^\(CN[[:space:]]*=\).*$$/\1 $(domain)/" ssl.cnf
	openssl req -new -nodes -config ssl.cnf -key ssl-key.pem -out ssl-csr.pem

ssl-cert.pem: ssl-csr.pem ssl-key.pem
	openssl x509 -req -days 365 -in ssl-csr.pem -signkey ssl-key.pem -out ssl-cert.pem

.PHONY: all