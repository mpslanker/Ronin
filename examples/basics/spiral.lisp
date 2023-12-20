; animated recusive spiral

(def frame 
  (get-frame))

;
(defn rec 
  (v) 
  (if 
    (gt v 0) 
    ( 
      ; params 
      (def spiral-x 
        (add frame:c 
          (mul 
            (cos 
              (add 
                (div v 17) 
                (time 0.001))) 
            (div v 2)))) 
      (def spiral-y 
        (add frame:m 
          (mul 
            (sin 
              (div v 11)) 
            (div v 2)))) 
      (def spiral-r 
        (div v 2)) 
      ; draw 
      (stroke 
        (circle spiral-x spiral-y spiral-r) 
        (color (add (mul (sin (add (mul .3 v) 0)) 127) 128) (add (mul (sin (add (mul .3 v) 2)) 127) 128) (add (mul (sin (add (mul .3 v) 4)) 127) 128) 0.1) 1)
      (rec 
        (sub v 0.5)))))
 
;
(defn redraw () 
  
    (clear) 
    (rec 300))

;
(on "animate" redraw)