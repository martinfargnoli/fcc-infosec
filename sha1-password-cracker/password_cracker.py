import hashlib


def read_add_to_arr(file_name, arr):
  with open(file_name, "rb") as f:
    line = f.readline().strip()
    while line:
      arr.append(line)
      line = f.readline().strip()


def crack_sha1_hash(hash, use_salts=False):
  pass_arr = []
  pass_dict = {}
  read_add_to_arr("top-10000-passwords.txt", pass_arr)

  if use_salts:
    top_salts = []
    top_salt_passwords = {}
    read_add_to_arr("known-salts.txt", top_salts)
    for bsalt in top_salts:
      for bpass in pass_arr:
        pre_salt = hashlib.sha1(bsalt + bpass).hexdigest()
        post_salt = hashlib.sha1(bpass + bsalt).hexdigest()
        top_salt_passwords[pre_salt] = bpass.decode("utf-8")
        top_salt_passwords[post_salt] = bpass.decode("utf-8")
    if hash in top_salt_passwords:
      return top_salt_passwords[hash]

  for pw in pass_arr:
    hash_line = hashlib.sha1(pw).hexdigest()
    pass_dict[hash_line] = pw.decode("utf-8")

  if hash in pass_dict:
    return pass_dict[hash]

  return "PASSWORD NOT IN DATABASE"
