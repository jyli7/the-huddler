class HuddlesController < ApplicationController
	before_filter :find_huddle, only: [:edit, :update, :vote_page, :submit_vote]

  def new
  	@huddle = Huddle.create
  	redirect_to edit_huddle_path(@huddle)
  end

  def edit
  	@huddle = Huddle.find(params[:id])
  end

  def update
  	restaurant_id = yelp_api.get_id_from_url(params[:restaurant_url])
  	begin
  		restaurant_info = JSON.parse(yelp_api.restaurant(restaurant_id))
  		@huddle.nominations.create!({
  			restaurant_id: restaurant_id,
  			url: restaurant_info["url"],
  			name: restaurant_info["name"],
  			rating: restaurant_info["rating"].to_f,
  			categories: restaurant_info["categories"]
  		})
  	rescue Mongoid::Errors::Validations => e
  		flash[:error] = "You've already added this restaurant to your huddle"
  	rescue JSON::ParserError => e
  		flash[:error] = "Restaurant not found. Please try again, with restaurant's full url."
  	end
  	redirect_to edit_huddle_path(@huddle)
  end

  def vote_page
  end

  def submit_vote
  	@huddle.nominations.each do |nom|
  		nom_score = params[nom.id.to_s].to_i if params[nom.id.to_s].present?
  		nom.add_to_score!(nom_score)
  	end
  	redirect_to vote_page_huddle_path(@huddle)
  end

  private

  	def find_huddle
  		@huddle = Huddle.find(params[:id])
  	end

	  def yelp_api
	  	Yelp.new
	  end

end
