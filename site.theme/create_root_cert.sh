###### PICK ONE OF THE TWO FOLLOWING ######

# OPTION ONE: RSA key. these are very well-supported around the internet.
# you can swap out 4096 for whatever RSA key size you want. this'll generate a key
# with password "xxxx" and then turn around and re-export it without a password,
# because genrsa doesn't work without a password of at least 4 characters.
#
# some appliance hardware only works w/2048 so if you're doing IOT keep that in
# mind as you generate CA and client keys. i've found that frirefox & chrome will
# happily work with stuff in the bigger 8192 ranges, but doing that vs sticking with
# 4096 doesn't buy you that much extra practical security anyway.

# openssl genrsa -aes256 -passout pass:xxxx -out ca.pass.key 4096
# openssl rsa -passin pass:xxxx -in ca.pass.key -out ca.key
# rm ca.pass.key

# OPTION TWO: make an elliptic curve-based key.
# support for ECC varies widely, and support for the predefined curves also varies.
# it's "secp256r1" in this case, which is as well-supported as it gets but if you want to
# avoid NIST-provided things, or if you want to go with bigger/newer keys, you can
# swap that out:
#
# * check your openssl supported curves: `openssl ecparam -list_curves`
# * check client support for whatever browser/language/system/device you want to use:
#      https://en.wikipedia.org/wiki/Comparison_of_TLS_implementations#Supported_elliptic_curves

openssl ecparam -genkey -name secp256r1 | openssl ec -out ca.key

###### END  "PICK ONE" SECTION ######

# whichever you picked, you should now have a `ca.key` file.

# now generate the CA root cert
# when prompted, use whatever you'd like, but i'd recommend some human-readable Organization
# and Common Name.
openssl req -new -x509 -days 3650 -key ca.key -out ca.pem