export const myHomePage = (
<html>
<head>
	<meta charset="utf-8"/>
	<meta name="viewport" content="width=device-width"/>
	<title>Reds</title>
	<link rel="icon/png" href="/assets/img/RC.png" />
  <link rel="icon" type="image/x-icon" href="/assets/img/favicons/favicon.ico"/>
	<link href="/index.css" rel="stylesheet" type="text/css" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>
	<link href="/assets/atom-loader.css" rel="stylesheet" type="text/css" />
</head>
<body data-slug="index">
  <nav class="navbar">
    <div class="navbar-container">
      <a href="/index" class="logo">Red's</a>
      <input class="menu-btn" type="checkbox" id="menu-btn" />
      <label class="menu-icon" for="menu-btn"><span class="navicon"></span></label>
      <ul class="menu">
        <li><a href="/index">Home</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </div>
  </nav>
	<div id="home">
		<div id='myName'>Hello I'm <br/><span style="font-size:300%">Reds</span></div>
		<div id='whoAmI'>A chemistry student with a digital mindset.</div>
	</div>
	<section id="about" class='section'>
		<h2>About me</h2>
		<i style="font-family:'Fira Sans';">There are less reasons for giving up than for keep fighting.</i>
		<i style="font-family:'Fira Sans';"></i>
	</section>
	<section id="careers" class='section'>
		<h2>What I do</h2>
		<div id='career-container'>
			<div class='career-item'>
				<div class='icon'><a href='/index.html'>
						<div class="atom">
							<div class="electron"></div>
							<div class="electron"></div>
							<div class="electron"></div>
						</div>
					</a>
				</div>
				<div class='career-item-summary'>
					Studying Computational Chemistry at University.
          <br/><a href='/assets/404.html'>See more</a>
				</div>
			</div>
			<div class='career-item'>
				<div class='icon' style='background-image: url("/assets/img/computer.gif"); background-size:contain;'>
				</div>
				<div class='career-item-summary'>
					Learning programming and cybersecurity on my free time.
					<br/><a href='/tags/cybersecurity'>See more</a>
				</div>
			</div>
		</div>
	</section>
</body>
</html>
)



export const myContact = (
<html>
<head>
	<meta charset="utf-8"/>
	<meta name="viewport" content="width=device-width"/>
	<title>Reds</title>
	<link rel="icon/png" href="/assets/img/RC.png" />
  <link rel="icon" type="image/x-icon" href="/assets/img/favicons/favicon.ico"/>
	<link href="/index.css" rel="stylesheet" type="text/css" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>
	<link href="/assets/atom-loader.css" rel="stylesheet" type="text/css" />
</head>
<body data-slug="contact">
  <nav class="navbar">
    <div class="navbar-container">
      <a href="/index" class="logo">Red's</a>
      <input class="menu-btn" type="checkbox" id="menu-btn" />
      <label class="menu-icon" for="menu-btn"><span class="navicon"></span></label>
      <ul class="menu">
        <li><a href="/index">Home</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </div>
  </nav>
  	<section id="contact" class='section' style="margin-top:80px">
		<h2 class="center">Get in Touch</h2>
		<div id="form-container">
			<form target="_blank" action="https://formsubmit.co/42067fc53c7600f6b9e11764259c976d" method="POST">
				<input type="text" name="name" class="form-control" placeholder="Your Name" required/>
				<input type="email" name="email" class="form-control" placeholder="Email Address" required/>
				<textarea placeholder="Your Message" class="form-control" name="message" rows="10" required></textarea>

				<button type="submit" class="btn">Send Me an Email</button>
			</form>
		</div>
	</section>



	<section class='section'>
		<h2 class="center">Follow Along</h2>
		<div id='links'>
			<a href='https://github.com/redscorpse' target='_blank' class='fa-brands fa-square-github'></a>
			<a href='https://twitter.com/redsc0rpse' target='_blank' class='fa-brands fa-square-x-twitter'></a>
			<a href='https://www.linkedin.com/mwlite/in/ana-rojas-15528419a' target='_blank'
				class='fa-brands fa-linkedin'></a>
		</div>
	</section>

</body>
</html>
)
