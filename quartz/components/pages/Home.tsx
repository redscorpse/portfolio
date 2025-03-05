export const HomePage = (
<html>
<head>
	<meta charset="utf-8"/>
	<meta name="viewport" content="width=device-width"/>
	<title>Reds</title>
  <link rel="icon" type="image/x-icon" href="static/favicons/icon.gif"/>
	<link href="/index.css" rel="stylesheet" type="text/css" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>
	<link href="/assets/atom-loader.css" rel="stylesheet" type="text/css" />
</head>
<body data-slug="index">
  <div id="preloader"></div>
  <script src="/assets/js/preloader.js"></script>
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
		<div id='whoAmI'>The incoherence of</div>
	</div>
	<section id="about" class='section'>
		<h2>About me</h2>	
    <p><i>There are less reasons for giving up than for keep fighting.</i></p>
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
					<p>✦ University degree in Computational Chemistry.</p>
          <p>✦ Cybersecurity student.</p>
          <p>✦ <a href='https://www.caixabank.com/en/headlines/news/caixabank-and-microsoft-recognize-the-best-female-stem-students-in-in-spain-with-the-wonnow-awards-24'>WONNWOW 2024 Awards</a></p>
				</div>
			</div>
			<div class='career-item'>
				<div class='icon' style='background-image: url("/assets/img/computer.gif"); background-size:contain;'>
				</div>
				<div class='career-item-summary'>
					<p>✧ Learning programming on my free time.</p>
					<p>✧ I use Debian [<i class="fa-brands fa-debian"></i>] btw.</p>
          <p>✧ Poetry, philosophy and music.</p>
				</div>
			</div>
		</div>
	</section>
</body>
<script defer src="https://analytics.eu.umami.is/script.js" data-website-id="9079a4e3-0775-4419-bd65-242f5b0e7e3c"></script>
</html>
)
