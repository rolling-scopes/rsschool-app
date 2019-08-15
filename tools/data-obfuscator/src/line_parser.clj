(ns line-parser
  (:require [clojure.string :as s]))


(defn parse-line-into-columns
  [line]
  (partial not-empty) (s/split line #"\t"))

(defn get-line-tabs-cfg
  [line]
  (map first (re-seq #"(\t+)" line)))

(defn combine-columns-into-line
  [columns line-tabs-cfg]
  (->> columns
      (map #(if (= % "") "\\N" %))
      (s/join "\t")))
