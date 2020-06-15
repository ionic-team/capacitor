package com.getcapacitor.myapp;

import android.net.Uri;
import android.os.Bundle;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.viewpager.widget.ViewPager;

import com.getcapacitor.BridgeFragment;

public class SimpleFragmentActivity extends AppCompatActivity implements BridgeFragment.OnFragmentInteractionListener {
  private TextView mTextMessage;
  private ViewPager mViewPager;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_fragment_simple);
  }



  @Override
  public void onFragmentInteraction(Uri uri) {
  }
}
