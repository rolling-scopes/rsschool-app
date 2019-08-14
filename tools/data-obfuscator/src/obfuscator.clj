(ns obfuscator
  (:require
   [clojure.string :as s]
   [fake :as faker]

   [line-parser :as line-parser]
   [table-parser :as table-parser]
   [hashing :as hashing]))


(defn create-obfuscators
  [sault]
  {:hash (hashing/gen-hash sault)
   :obfuscate-github faker/fake-github
   :obfuscate-first-name faker/fake-first-name
   :obfuscate-last-name faker/fake-last-name
   :obfuscate-email faker/fake-email
   :obfuscate-phone faker/fake-phone
   :obfuscate-comment faker/lorem-paragraph
   :obfuscate-location faker/fake-city
   :obfuscate-url faker/fake-url
   :empty-vec (fn [& args] [])
   :default identity})

(defn make-row-obfuscator
  [config obfuscators-cfg]
  (map (fn [[column obfuscation-type]]
         (get obfuscators-cfg obfuscation-type (:default obfuscators-cfg)))
       config))

(defn schemas-obfuscators
  [schemas obfuscators-cfg]
  (map (fn [[schema-name config]]
         [schema-name (make-row-obfuscator config obfuscators-cfg)])
       schemas))

(defn generate-obfuscators-for-tables
  "generates vector of obfuscators(each column) for each schema"
  [obfuscation-cfg obfuscators]
  (into {} (schemas-obfuscators obfuscation-cfg obfuscators)))

(defn obfuscate-row
  [columns row-obfuscator]
  (map (fn [[v o]] (o v))
       (mapcat (comp vector vector) columns row-obfuscator)))

(defn obfuscate-table
  [lines line-obfuscators]
  (map
    (fn [dirty-row]
      (let [line-tabs-cfg (line-parser/get-line-tabs-cfg dirty-row)]
        (-> (line-parser/parse-line-into-columns dirty-row)
            (obfuscate-row line-obfuscators)
            (line-parser/combine-columns-into-line line-tabs-cfg))))
    lines))

(defn obfuscate-dump
  "-> (<table-name> <obfuscated-inserted-lines>)"
  [dump tables-obfuscators]
  (map
    (fn [[table-name row-obfuscators]]
      {table-name (-> (table-parser/get-table-content dump table-name)
                      (table-parser/parse-table-on-lines)
                      (obfuscate-table row-obfuscators)
                      ((partial s/join "\n")))})
    tables-obfuscators))
