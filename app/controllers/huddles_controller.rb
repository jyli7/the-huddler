class HuddlesController < ApplicationController
	before_filter :find_huddle, only: [:edit, :update]

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
  		flash[:error] = "Invalid input. Please enter full restaurant URL."
  	end
  	# rescue
  	# 	binding.pry
  	# 	flash[:error] = "Restaurant not found"
  	# end
  	redirect_to edit_huddle_path(@huddle)
  end

  private

  	def find_huddle
  		@huddle = Huddle.find(params[:id])
  	end

	  def yelp_api
	  	Yelp.new
	  end

end
