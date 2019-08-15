(ns replacer)


(defn get-table-content-regex
  [table-name]
  (re-pattern (str "(-- Data for Name: " table-name ".*\\n--\\n\\nCOPY.*\\n)([\\s\\S]*?)(\\\\\\.)")))

(defn replace-table-content-by
  [dump table-name content]
  (clojure.string/replace
   dump
   (get-table-content-regex table-name)
   (str "$1" (clojure.string/re-quote-replacement content) "\n$3")))

(defn dump->obfuscated-dump
  [dump obfuscated-tables-lines]
  (reduce-kv replace-table-content-by
             dump
             (into (sorted-map) obfuscated-tables-lines)))
