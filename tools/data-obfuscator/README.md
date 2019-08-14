# Description

This package solves the data obfuscation problem.

Suppose that you have a database with production data and you want to share it. It can be tricky if there are a lot of personal data exist. So let's hide the most sensetive chunks and share after that.

# Requirements

java 8+
clojure 1.8+

# Usage

They concept is that firstly we need to create an obfuscation config. We can do that by passing **sql** data to the obfuscator(the config will be in the **edn** format):

```
cat dump.sql | clj -m main action=generate-config > obfuscation-config.edn
```

After that you can specify columns and how should be obfuscated.

Lets consider an example. Suppose that the config was created with the following scheme:

```
{
 ;;; other schemes ;;;

 "user"
 [["id" :hash]
  ["firstName" :obfuscate-first-name]
  ["lastName" :obfuscate-last-name]
  ["email" :obfuscate-email]
  ["phone" :obfuscate-phone]
  ["field which we don' want to obfuscate"]

  ;;; other schemes ;;;
}
```

As you can see we just need to specify a type of obfuscator near the column. If we don't want to obfuscate some field we just skip it.

When the config was configured we can start the obfuscation process:

```
<pg_dump ... or dump.sql> | clj -m main config=<config file name> sault=supersecret228 > obfuscated-data.sql
```

Note: I reckon that the config is placed(and generated) in the obfuscator's root directory.
