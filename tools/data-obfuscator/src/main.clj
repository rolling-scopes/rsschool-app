(ns main
  (:import com.github.javafaker.Faker)
  (:require [obfuscator :as obfuscator]
            [obfuscator-cfg :as obfuscator-cfg]
            [line-parser :as line-parser]
            [table-parser :as table-parser]
            [replacer :as replacer]))


(defn parse-args-pair
  [str-pair]
  (update (clojure.string/split str-pair #"=") 0 keyword))

(defn parse-input-args
  [args]
  (into {} (map parse-args-pair args)))

(defn -main [& args]
  (let [args-map (parse-input-args args)
        file (slurp *in*)]
    (case (:action args-map)
          "generate-config" (print-dup (obfuscator-cfg/dump->obfuscation-cfg file) *out*)
          (print (let [obfuscators (obfuscator/create-obfuscators (:sault args-map))
                       tables-obfuscators (-> (slurp (:config args-map))
                                           (clojure.edn/read-string)
                                           (obfuscator/generate-obfuscators-for-tables obfuscators))]
                  (as-> file f
                    (obfuscator/obfuscate-dump f tables-obfuscators)
                    (replacer/dump->obfuscated-dump file f)))))))
