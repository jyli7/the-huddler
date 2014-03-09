class Yelp
	# Move this to ENV variables
	CONSUMER_KEY = ENV['YELP_CONSUMER_KEY']
	CONSUMER_SECRET = ENV['YELP_CONSUMER_SECRET']
	TOKEN = ENV['YELP_TOKEN']
	TOKEN_SECRET = ENV['YELP_TOKEN_SECRET']

	API_HOST = 'http://api.yelp.com'

	attr_accessor :access_token

	def initialize
		consumer = OAuth::Consumer.new(CONSUMER_KEY, CONSUMER_SECRET, {:site => "#{API_HOST}"})
		@access_token = OAuth::AccessToken.new(consumer, TOKEN, TOKEN_SECRET)
	end

	def nyc_restaurants
		path = "/v2/search?term=restaurants&location=new%20york"
		access_token.get(path).body
	end

	def restaurant(id)
		path = "/v2/business/#{id}"
		access_token.get(path).body
	end

	def get_id_from_url(url)
		result = /biz\/([^\/]*)\/*/.match(url)
		result[1] if result && result.is_a?(MatchData)
	end
	
end