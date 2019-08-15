(ns obfuscator-cfg
  (:require [clojure.string :as s]))


(def get-table-schema-regex #"-- Data for Name: (\w*\w);.*\n--\n\nCOPY .* \((.*)\)")

(defn dirty-schema-columns->clear-columns-names
  "id, \"createdDate\", \"updatedDate\" -> [id createdDate updatedDate]"
  [columns-str]
  (-> columns-str
      (s/replace #"\"|\\" "")
      (s/split #", ")))

(defn create-pair=schema-name+schema-columns
  [schema-name dirty-columns]
  {schema-name (->> dirty-columns
                    dirty-schema-columns->clear-columns-names
                    (mapv vector))})

(defn dump->obfuscation-cfg
  "[<schema-name> (<dirty-columns>)] -> {<schema-name> [<schema-columns>]}"
  [dump]
  (reduce (fn [acc [schema-name dirty-columns]]
            (merge acc (create-pair=schema-name+schema-columns schema-name dirty-columns)))
      {}
      (map rest (re-seq get-table-schema-regex dump))))
