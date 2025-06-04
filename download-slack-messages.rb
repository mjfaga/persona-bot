require 'net/http'
require 'uri'
require 'json'

# Configuration - replace with your values
SLACK_TOKEN = ENV.fetch('SLACK_BOT_TOKEN')
CHANNEL_ID = ENV.fetch('SLACK_CHANNEL_ID')
LIMIT = 100  # Number of messages per request

def fetch_messages(channel_id, cursor = nil)
  # Build the URL with parameters
  base_url = "https://slack.com/api/conversations.history"
  params = { channel: channel_id, limit: LIMIT }
  params[:cursor] = cursor if cursor

  # Create the URI with parameters
  uri = URI(base_url)
  uri.query = URI.encode_www_form(params)

  # Set up the HTTP request
  request = Net::HTTP::Get.new(uri)
  request["Authorization"] = "Bearer #{SLACK_TOKEN}"
  request["Content-Type"] = "application/x-www-form-urlencoded"

  # Make the request
  response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
    http.request(request)
  end

  # Parse and return the JSON response
  JSON.parse(response.body)
end

def extract_all_messages(channel_id)
  all_messages = []
  cursor = nil
  page_count = 0

  loop do
    page_count += 1
    puts "Fetching page #{page_count}..."

    # Get the current page of messages
    response = fetch_messages(channel_id, cursor)

    # Check if the request was successful
    unless response["ok"]
      puts "Error: #{response["error"]}"
      break
    end

    # Extract the message text from each message and add to our array
    messages = response["messages"] || []
    messages.each do |message|
      # You can modify this to extract other fields or handle different message types
      all_messages << {
        text: message["text"],
        user: message["user"],
        ts: message["ts"],
        # Add any other fields you want to extract
      }
    end

    puts "Retrieved #{messages.size} messages (total so far: #{all_messages.size})"

    # Check if there are more messages to fetch
    cursor = response.dig("response_metadata", "next_cursor")
    break if cursor.nil? || cursor.empty?
  end

  all_messages
end

# Main execution
messages = extract_all_messages(CHANNEL_ID)
puts "Retrieved a total of #{messages.size} messages"

# Optional: Save to a file
File.write("slack_messages.json", JSON.pretty_generate(messages))
puts "Messages saved to slack_messages.json"

# Example of how to access the messages
puts "\nFirst 5 messages (preview):"
messages.first(5).each_with_index do |msg, i|
  puts "#{i+1}. #{msg[:text].slice(0, 50)}..."
engg
