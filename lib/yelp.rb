module Yelp
	class API
		include HTTParty

		base_uri 'http://sendgrid.com/api/newsletter'
		default_params :api_user => 'Tribeca Film News', :api_key => 'tribeca375'
		format :json

		attr_accessor :name

		def initialize(name)
			@name = name
		end

		def get
			get('/get', query: {name: self.name})
		end

		def self.get_all
			get("/list/get.json")
		end

	end
end