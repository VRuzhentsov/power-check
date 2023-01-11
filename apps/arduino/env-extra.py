from os.path import isfile
Import("env")
assert isfile("../../.env")
try:
    f = open("../../.env", "r")
    print("[env-extra] Parsing .env ...")
    lines = f.readlines()
    envs = []

    for line in lines:
        key, value = line.strip().split("=")
        if key[0] == "#":
            continue
        envs.append("-D{}".format(key + "=" + env.StringifyMacro(value)))

    print(envs)
    env.Append(BUILD_FLAGS=envs)
except IOError:
    print("File .env not accessible",)
finally:
    f.close()