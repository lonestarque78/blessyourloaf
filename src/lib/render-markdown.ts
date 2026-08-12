// Minimal markdown-to-HTML for AI chat replies (headings, bold, bullet lists, paragraphs).
// Not a general-purpose renderer — just what Claude's responses in this app actually use.
// Moved here from troubleshooter/page.tsx (previously the only caller) so
// ingredient-substitution can reuse it.
export function renderMarkdown(text: string): string {
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const inline = (s: string) => escape(s).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  const blocks: string[] = []

  for (const para of text.split(/\n\n+/)) {
    const lines = para.split('\n')
    let listItems: string[] = []
    let paraLines: string[] = []

    const flushList = () => {
      if (listItems.length > 0) {
        blocks.push(`<ul class="list-disc list-inside space-y-1 my-2 pl-2">${listItems.join('')}</ul>`)
        listItems = []
      }
    }
    const flushPara = () => {
      if (paraLines.length > 0) {
        blocks.push(`<p class="leading-relaxed mb-2">${paraLines.join('<br />')}</p>`)
        paraLines = []
      }
    }

    for (const line of lines) {
      if (/^###\s+/.test(line)) {
        flushPara(); flushList()
        blocks.push(`<p class="font-semibold text-sm text-[#5a3a2a] mt-3 mb-0.5">${inline(line.replace(/^###\s+/, ''))}</p>`)
      } else if (/^##\s+/.test(line)) {
        flushPara(); flushList()
        blocks.push(`<p class="font-semibold text-[#5a3a2a] mt-3 mb-0.5">${inline(line.replace(/^##\s+/, ''))}</p>`)
      } else if (/^[-*]\s+/.test(line)) {
        flushPara()
        listItems.push(`<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`)
      } else if (line.trim()) {
        flushList()
        paraLines.push(inline(line))
      }
    }

    flushPara(); flushList()
  }

  return blocks.join('')
}
