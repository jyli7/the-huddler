class HuddlesController < ApplicationController
	before_filter :find_huddle, only: [:edit, :add_restaurant, :vote_page, :submit_vote, :invite_voter, :invite_voters]

  def new
  	@huddle = Huddle.create
  	redirect_to edit_huddle_path(@huddle)
  end

  def edit
  	@huddle = Huddle.find(params[:id])
  end

  def add_restaurant
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

  def invite_voter
  	if params[:invitee_email]
      if !@huddle.invited_emails.include?(params[:invitee_email])
  		  @huddle.invite_this_email!(params[:invitee_email])
      else
        flash[:error] = "You already invited this email"
      end   
  	end
  	redirect_to invite_voters_huddle_path(@huddle)
  end

  def invite_voters
  end

  def vote_page
    if !params[:invite_token] || !@huddle.invited_this_token?(params[:invite_token])
      flash[:error] = "You were not invited to this huddle"
      redirect_to root_path
    elsif @huddle.invited_this_token?(params[:invite_token]) and
          @huddle.token_exhausted?(params[:invite_token])
      flash[:error] = "You already voted in this huddle"
      redirect_to root_path
    else
      render 'vote_page'
    end
  end

  def submit_vote
    @huddle.submit_votes!(params[:invite_token], params[:votes])
    @sorted_nominations = @huddle.nominations.order_by(:total_score.desc)
    render 'voting_results'
  end

  private

  	def find_huddle
  		@huddle = Huddle.find(params[:id])
  	end

	  def yelp_api
	  	Yelp.new
	  end

end
