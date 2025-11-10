/**
 * Test utilities for the Faleproxy application
 */

// Sample HTML with Yale references
const sampleHtmlWithYale = `
<!DOCTYPE html>
<html>
<head>
  <title>Yale University Test Page</title>
  <meta name="description" content="This is a test page about Yale University">
</head>
<body>
  <header>
    <h1>Welcome to Yale University</h1>
    <nav>
      <a href="https://www.yale.edu/about">About Yale</a>
      <a href="https://www.yale.edu/admissions">Yale Admissions</a>
    </nav>
  </header>
  <main>
    <p>Yale University is a private Ivy League research university in New Haven, Connecticut.</p>
    <p>Yale was founded in 1701 as the Collegiate School.</p>
    <div class="yale-info">
      <p>Yale has produced many notable alumni, including:</p>
      <ul>
        <li>Five U.S. Presidents</li>
        <li>Yale graduates have also been leaders in many fields</li>
      </ul>
    </div>
    <img src="https://www.yale.edu/images/logo.png" alt="Yale Logo">
    <a href="mailto:info@yale.edu">Contact Yale</a>
  </main>
  <script>
    // Some JavaScript with Yale references
    const yaleInfo = {
      name: "Yale University",
      founded: 1701,
      website: "https://www.yale.edu"
    };
    console.log("This is " + yaleInfo.name);
  </script>
</body>
</html>
`;

module.exports = {
  sampleHtmlWithYale,
};
