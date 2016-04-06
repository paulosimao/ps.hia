# ps.hia
HIA - Stands for here I am. Its a simple tool I created to track my Raspberry PI at home.

I have installed this in my Raspberry PI so I can track it from any where I am.

In case in the same local network, you can find running listener.js.(it publishes itself through UDP).

From the outside world, it will tell you whenever its external IP changes  through mail (please config it) and Pushbullet, please check its API so you get our own token.

It can optionally do a speedtest once a while (60 min), in case you dont trust your provided.

Please refer to config.js to get better awareness on the wayt to config it.

I promisse I will improve docs soon or later.