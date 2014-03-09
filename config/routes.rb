TheHuddler::Application.routes.draw do
  root :to => "home#index"
  devise_for :users, :controllers => {:registrations => "registrations"}
  resources :users

  resources :huddles do
  	member do
  		get :vote_page
  		put :submit_vote
  		put :add_restaurant
  		get :invite_voters
  		put :invite_voter
      get :voting_results
  	end
  end
end