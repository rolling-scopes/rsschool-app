(ns table-parser)


(defn get-table-content-regex
  [table-name]
  (re-pattern (str "-- Data for Name: " table-name ".*\\n--\\n\\nCOPY.*\\n([\\s\\S]*?)\\\\\\.")))

(defn get-table-content
  [src table-name]
  (-> (re-seq (get-table-content-regex table-name) src)
      first
      second))

(defn parse-table-on-lines
  [table]
  (clojure.string/split table #"\n"))
