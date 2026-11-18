// One page, six one-digit inputs. The code is random on every page load.
import { createServer } from 'node:http';
import { randomInt } from 'node:crypto';

const PORT = Number(process.env.PORT ?? 3200);

createServer((req, res) => {
  if (req.url !== '/') return res.writeHead(404).end();
  const code = String(randomInt(1_000_000)).padStart(6, '0');
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(page(code));
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));

const page = (code) => `<!doctype html>
<html lang="en">
<title>OTP repro</title>
<main>
  <h1>Verify</h1>
  <p>Your code is ${code}</p>
  <div role="group" aria-label="Code">
    ${['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth']
      .map((n) => `<input aria-label="${n} digit" inputmode="numeric" maxlength="1" autocomplete="one-time-code">`)
      .join('\n    ')}
  </div>
  <p role="status"></p>
</main>
<script>
  const boxes = [...document.querySelectorAll('input')];
  const status = document.querySelector('[role=status]');
  boxes.forEach((box, i) => box.addEventListener('input', () => {
    box.value = box.value.replace(/\\D/g, '').slice(-1);
    if (box.value && boxes[i + 1]) boxes[i + 1].focus();
    if (boxes.every((b) => b.value)) {
      const ok = boxes.map((b) => b.value).join('') === '${code}';
      status.textContent = ok ? 'Code verified' : 'Incorrect code';
      if (!ok) { boxes.forEach((b) => (b.value = '')); boxes[0].focus(); }
    }
  }));
</script>
</html>`;
