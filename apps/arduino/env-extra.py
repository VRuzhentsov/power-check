from os.path import isfile
Import("env")
assert isfile("../../.env")
try:
    f = open("../../.env", "r")
    print("[env-extra] Parsing .env ...")
    lines = f.readlines()
    envs = []
    # config = {
    #     **dotenv_values(".env.shared"),  # load shared development variables
    #     **dotenv_values(".env.secret"),  # load sensitive variables
    #     **os.environ,  # override loaded values with environment variables
    # }
    for line in lines:
        # envs.append("-D{}".format(line.strip()))
        # envs.append("-D{}".format(line.strip()))
        key, value = line.strip().split("=");
        # print("key: " + key)
        # print("value: " + value)
        envs.append("-D{}".format(key + "=" + env.StringifyMacro(value)))
        # envs.append('-D ' + line.strip().replace('"', '\\\"'))
        # envs.append(f"-D {}".format(line.strip())
    #
    print(envs)
    env.Append(BUILD_FLAGS=envs)
    # print(env.Dump())
except IOError:
    print("File .env not accessible",)
finally:
    f.close()