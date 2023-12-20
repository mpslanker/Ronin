(resize 800 800)
(clear)
 
(def num 2000)
 
(def phi 
  (λ 
    (a) 
    (
      (mul 
        (div 
          (mul 2 PI) num) a))))
 
(map 
  (range 0 
    (sub num 1) 1) 
  (λ 
    (a) 
    (stroke 
      (rect 
        (sub(add 550 
          (mul 100 
            (sin 
              (phi a)))) 160)
        (add (add 150 
          (mul 100 
            (cos 
              (phi a)))) 210)
        (mul 100 
          (cos 
            (phi a)))
        100) 
      (color 255 255 255 0.08) 1)))

(stroke (rect 0 0 800 800) (color 255 255 255 255) 4)