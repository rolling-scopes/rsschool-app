(ns fake
  (:import com.github.javafaker.Faker))


(defn fake-first-name
  [& x]
  (.. (Faker.) name firstName))

(defn fake-last-name
  [& x]
  (.. (Faker.) name lastName))

(defn fake-full-name
  [& x]
  (.. (Faker.) name fullName))
  
(defn fake-email
  [& x]
  (.. (Faker.) internet emailAddress))

(defn fake-github
  [& x]
  (clojure.string/lower-case
   (str (.. (Faker.) name firstName)
        (.. (Faker.) number (numberBetween 10 99999))
        (.. (Faker.) name lastName)
        "_fake_github")))

(defn fake-phone
  [& x]
  (str "+375"
       (rand-nth ["25" "29" "44"])
       (.. (Faker.) number (numberBetween 1000000 9999999))))

(defn lorem-paragraph
  [& x]
  (.. (Faker.) lorem paragraph))

(defn fake-city
  [& x]
  (.. (Faker.) address city))

(defn fake-url
  [& x]
  (.. (Faker.) internet url))
