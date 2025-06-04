require 'json'

# Read and parse the JSON file
file_content = File.read('./slack_messages.json')
data = JSON.parse(file_content)

text = []
data.each do |line|
  text << line['text'].gsub(/['">“”]/, '').gsub('&gt;', '').gsub("\n", ' ').strip
end

text.each do |line|
  puts "* #{line}"
end
